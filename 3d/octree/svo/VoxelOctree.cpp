/*
Copyright (c) 2013 Benedikt Bitterli

This software is provided 'as-is', without any express or implied
warranty. In no event will the authors be held liable for any damages
arising from the use of this software.

Permission is granted to anyone to use this software for any purpose,
including commercial applications, and to alter it and redistribute it
freely, subject to the following restrictions:

   1. The origin of this software must not be misrepresented; you must not
   claim that you wrote the original software. If you use this software
   in a product, an acknowledgment in the product documentation would be
   appreciated but is not required.

   2. Altered source versions must be plainly marked as such, and must not be
   misrepresented as being the original software.

   3. This notice may not be removed or altered from any source
   distribution.
*/

/**
 * Altered version by Manuel Martín 2016
 */

#include "VoxelOctree.hpp"
#include "VoxelData.hpp"

#include "../third-party/lz4.h"

#include <iostream>
#include <bitset>
#include <sstream>

static const uint32 BitCount[] = {
        0, 1, 1, 2, 1, 2, 2, 3, 1, 2, 2, 3, 2, 3, 3, 4,
        1, 2, 2, 3, 2, 3, 3, 4, 2, 3, 3, 4, 3, 4, 4, 5,
        1, 2, 2, 3, 2, 3, 3, 4, 2, 3, 3, 4, 3, 4, 4, 5,
        2, 3, 3, 4, 3, 4, 4, 5, 3, 4, 4, 5, 4, 5, 5, 6,
        1, 2, 2, 3, 2, 3, 3, 4, 2, 3, 3, 4, 3, 4, 4, 5,
        2, 3, 3, 4, 3, 4, 4, 5, 3, 4, 4, 5, 4, 5, 5, 6,
        2, 3, 3, 4, 3, 4, 4, 5, 3, 4, 4, 5, 4, 5, 5, 6,
        3, 4, 4, 5, 4, 5, 5, 6, 4, 5, 5, 6, 5, 6, 6, 7,
        1, 2, 2, 3, 2, 3, 3, 4, 2, 3, 3, 4, 3, 4, 4, 5,
        2, 3, 3, 4, 3, 4, 4, 5, 3, 4, 4, 5, 4, 5, 5, 6,
        2, 3, 3, 4, 3, 4, 4, 5, 3, 4, 4, 5, 4, 5, 5, 6,
        3, 4, 4, 5, 4, 5, 5, 6, 4, 5, 5, 6, 5, 6, 6, 7,
        2, 3, 3, 4, 3, 4, 4, 5, 3, 4, 4, 5, 4, 5, 5, 6,
        3, 4, 4, 5, 4, 5, 5, 6, 4, 5, 5, 6, 5, 6, 6, 7,
        3, 4, 4, 5, 4, 5, 5, 6, 4, 5, 5, 6, 5, 6, 6, 7,
        4, 5, 5, 6, 5, 6, 6, 7, 5, 6, 6, 7, 6, 7, 7, 8
};

static const size_t CompressionBlockSize = 64 * 1024 * 1024;

/**
 * Carga un octree desde disco
 * @param path
 * @return
 */
VoxelOctree::VoxelOctree(const char *path) :
        _voxels(0) {
    FILE *fp = fopen(path, "rb");

    if (fp) {

        fread(&_center.x, sizeof(float), 1, fp);
        fread(&_center.y, sizeof(float), 1, fp);
        fread(&_center.z, sizeof(float), 1, fp);
        fread(&_octreeSize, sizeof(uint64), 1, fp);

        _octree.reset(new uint32[_octreeSize]);

        std::unique_ptr<char[]> buffer(new char[LZ4_compressBound(CompressionBlockSize)]);
        char *dst = reinterpret_cast<char *>(_octree.get());

        LZ4_streamDecode_t *stream = LZ4_createStreamDecode();
        LZ4_setStreamDecode(stream, dst, 0);

        uint64 compressedSize = 0;
        for (uint64 offset = 0; offset < _octreeSize * sizeof(uint32); offset += CompressionBlockSize) {
            uint64 compSize;
            fread(&compSize, sizeof(uint64), 1, fp);
            fread(buffer.get(), sizeof(char), size_t(compSize), fp);

            int outSize = std::min<int>(_octreeSize * sizeof(uint32) - offset, CompressionBlockSize);
            LZ4_decompress_fast_continue(stream, buffer.get(), dst + offset, outSize);
            compressedSize += compSize + 8;
        }
        LZ4_freeStreamDecode(stream);

        fclose(fp);

        std::cout << "Octree size: " << prettyPrintMemory(_octreeSize * sizeof(uint32))
                  << " Compressed size: " << prettyPrintMemory(compressedSize) << std::endl;
    }
}

/**
 * Carga un octree desde voxeles en memoria (IVoxelData) a la representacion
 * de array de uint32
 * @param voxels
 * @return
 */
VoxelOctree::VoxelOctree(IVoxelData *voxels)
        : _voxels(voxels) {

    _depth = 0;

    // Create chunked allocator: efficient memory reservation by big chunks, fast insertions that are
    // put in correct order when calling finalize()
    std::unique_ptr<ChunkedAllocator<uint32>> octreeAllocator(new ChunkedAllocator<uint32>());

    // Make space for root node descriptor
    octreeAllocator->pushBack(0);

    buildOctree(*octreeAllocator, 0, 0, 0, _voxels->sideLength(), 0);

    // childOffset = 1
    (*octreeAllocator)[0] |= 1 << 18;

    // Compile one large contiguous array with the insertions
    _octreeSize = octreeAllocator->size() + octreeAllocator->insertionCount();
    _octree = octreeAllocator->finalize();

    _center = _voxels->getCenter();
}

/**
 * Builds an octree from a VoxelData object
 *
 * This algorithm doesn't work exactly like the NVIDIA one, in the NVIDIA one there
 * are voxels bigger than size 2 that can be leafs, that allows the representation of big filled
 * volumes with very few nodes. That's why each node descriptor is composed
 * by a childMask and a leafMask. This algorithm doesn't work well for representing volumetric data
 * It is only useful for rendering with a ray tracer.
 *
 *
 * @param allocator
 * @param x
 * @param y
 * @param z
 * @param size
 * @param descriptorIndex
 * @return
 */
uint64
VoxelOctree::buildOctree(ChunkedAllocator<uint32> &allocator, int x, int y, int z, int size, uint64 descriptorIndex) {
    _voxels->prepareDataAccess(x, y, z, size);

    _depth ++;
    std::string tabs = "";
    for (int j = 0; j < _depth; ++j) {
        tabs += "\t";
    }

    // Size of child octants
    int halfSize = size >> 1;

    // Position of child octants
    int posX[] = {x + halfSize, x, x + halfSize, x, x + halfSize, x, x + halfSize, x};
    int posY[] = {y + halfSize, y + halfSize, y, y, y + halfSize, y + halfSize, y, y};
    int posZ[] = {z + halfSize, z + halfSize, z + halfSize, z + halfSize, z, z, z, z};

    // Offset of child descriptor array?
    uint64 childOffset = uint64(allocator.size()) - descriptorIndex;

    // Calculate child mask, child indices and child count by checking the presence of voxels in each octant
    //TODO: change this, if an octant is full it should be a leaf node and we should stop the recursion and
    //TODO: also, the parent node leaf mask has to take this into account
    int childCount = 0;
    int childIndices[8];
    uint32 childMask = 0;
    for (int i = 0; i < 8; i++) {
        if (_voxels->cubeContainsVoxelsDestructive(posX[i], posY[i], posZ[i], halfSize)) {
            childMask |= 128 >> i;
            childIndices[childCount++] = i;
        }
    }

    bool hasLargeChildren = false;
    uint32 leafMask;
    if (halfSize == 1) {

        // Build leaf nodes, we just read the voxels and put them in the array
        leafMask = 0;

        for (int i = 0; i < childCount; i++) {
            int idx = childIndices[childCount - i - 1];
            allocator.pushBack(_voxels->getVoxelDestructive(posX[idx], posY[idx], posZ[idx]));
        }
    } else {

        // Build non-leaf child nodes
        // Reserve space for childCount node descriptors in the array (for the child octants)
        leafMask = childMask; // All childs of size bigger than 1 are non-leaf voxels by this construction method
        for (int i = 0; i < childCount; i++)
            allocator.pushBack(0);


        // Fill the array with the info of the subtree for each child octant,
        // calculate the hasLargeChildren flag for this node
        // calculate the offsets to the childs of the octants,
        // if too big, then we will put a far pointer in the octant descriptor
        uint64 grandChildOffsets[8];
        uint64 delta = 0;
        uint64 insertionCount = allocator.insertionCount();
        for (int i = 0; i < childCount; i++) {
            int idx = childIndices[childCount - i - 1];
            grandChildOffsets[i] = delta + buildOctree(allocator, posX[idx], posY[idx], posZ[idx],
                                                       halfSize, descriptorIndex + childOffset + i);

            _depth--;

            // We have to take into account any far pointers interleaved with data when calculating the offsets
            delta += allocator.insertionCount() - insertionCount;
            insertionCount = allocator.insertionCount();
            if (grandChildOffsets[i] > 0x3FFF) // 16.000~ aprox
                hasLargeChildren = true;
        }

        // At this point each subtree is generated and loaded into the array,
        // now we have to insert the offsets to child data in the child descriptors..
        // if a 14 bit offset is not enough then we insert a far 32 bit pointer adjacent to the
        // child descriptor. The offsets will be inserted as far pointers if we detected big offsets
        for (int i = 0; i < childCount; i++) {
            uint64 childIndex = descriptorIndex + childOffset + i;
            uint64 offset = grandChildOffsets[i];
            if (hasLargeChildren) {
                offset += childCount - i;
                allocator.insert(childIndex + 1, uint32(offset));
                allocator[childIndex] |= 0x20000; // far pointer flag
                offset >>= 32;
            }
            allocator[childIndex] |= uint32(offset << 18);
        }
    }

    // Complete this node descriptor with the child and leaf masks and the large children flag
    allocator[descriptorIndex] = (childMask << 8) | leafMask;
    if (hasLargeChildren)
        allocator[descriptorIndex] |= 0x10000;

    if(_depth < 5) {
        std::cout << tabs << "[*] Processed node (" << x << ", " << y << ", " << z << "): " << std::endl
                  << tabs << " - size " << size << std::endl
                  << tabs << " - descriptorIndex: " << descriptorIndex << std::endl
                  << tabs << " - childOffset = " << childOffset << std::endl
                  << tabs << " - childMask = " << std::bitset<8>(childMask) << std::endl
                  << tabs << " - leafMask = " << std::bitset<8>(leafMask) << std::endl
                  << tabs << " - hasLargeChildren: " << hasLargeChildren << std::endl
                  << tabs << " - descriptor: " << descriptorToString(allocator[descriptorIndex]) << std::endl;
        if(hasLargeChildren) {
            std::cout << tabs << " - childOffset: " << allocator[descriptorIndex] + 1 << std::endl;
        }
    }

    return childOffset;
}

/**
 *
 * Hace un raycast a traves del octree
 *
 * @param orig
 * @param dest
 * @param rayScale
 * @param normal normal of the intersected voxel
 * @param t
 * @return
 */
bool VoxelOctree::raymarch(const glm::vec3 &orig, const glm::vec3 &dest, float rayScale, uint32 &normal, float &t) {

    // Stack for recursion levels
    struct StackEntry {
        uint64 offset;
        float maxT;
    };
    StackEntry rayStack[MaxScale + 1];

    float origx = orig.x, origy = orig.y, origz = orig.z;
    float destx = dest.x, desty = dest.y, destz = dest.z;

    if (std::fabs(destx) < 1e-4f) destx = 1e-4f;
    if (std::fabs(desty) < 1e-4f) desty = 1e-4f;
    if (std::fabs(destz) < 1e-4f) destz = 1e-4f;

    float dTx = 1.0f / -std::fabs(destx);
    float dTy = 1.0f / -std::fabs(desty);
    float dTz = 1.0f / -std::fabs(destz);

    float bTx = dTx * origx;
    float bTy = dTy * origy;
    float bTz = dTz * origz;

    // calculate octantMask, determines de octant of the destination direction
    uint8 octantMask = 7;
    if (destx > 0.0f) octantMask ^= 1, bTx = 3.0f * dTx - bTx;
    if (desty > 0.0f) octantMask ^= 2, bTy = 3.0f * dTy - bTy;
    if (destz > 0.0f) octantMask ^= 4, bTz = 3.0f * dTz - bTz;

    float minT = std::max(2.0f * dTx - bTx, std::max(2.0f * dTy - bTy, 2.0f * dTz - bTz));
    float maxT = std::min(dTx - bTx, std::min(dTy - bTy, dTz - bTz));
    minT = std::max(minT, 0.0f);

    uint32 current = 0;
    uint64 parent = 0;
    int idx = 0;
    float posX = 1.0f;
    float posY = 1.0f;
    float posZ = 1.0f;
    int scale = MaxScale - 1;

    float scaleExp2 = 0.5f;

    if (1.5f * dTx - bTx > minT) idx ^= 1, posX = 1.5f;
    if (1.5f * dTy - bTy > minT) idx ^= 2, posY = 1.5f;
    if (1.5f * dTz - bTz > minT) idx ^= 4, posZ = 1.5f;

    // Recursion starts here, it goes from biggest node to smallest
    while (scale < MaxScale) {
        if (current == 0)
            current = _octree[parent];

        float cornerTX = posX * dTx - bTx;
        float cornerTY = posY * dTy - bTy;
        float cornerTZ = posZ * dTz - bTz;
        float maxTC = std::min(cornerTX, std::min(cornerTY, cornerTZ));

        int childShift = idx ^octantMask; // shift to locate child position between 8 available
        uint32 childMasks = current << childShift;

        if ((childMasks & 0x8000) && minT <= maxT) {
            if (maxTC * rayScale >= scaleExp2) {
                t = maxTC;
                return true;
            }

            float maxTV = std::min(maxT, maxTC);
            float half = scaleExp2 * 0.5f;
            float centerTX = half * dTx + cornerTX;
            float centerTY = half * dTy + cornerTY;
            float centerTZ = half * dTz + cornerTZ;

            if (minT <= maxTV) {

                // Calculate child offset, its either within the current no descriptor or it is a FAR pointer
                uint64 childOffset = current >> 18;
                if (current & 0x20000) // hasLargeChildren
                    childOffset = (childOffset << 32) | uint64(_octree[parent + 1]);

                if (!(childMasks & 0x80)) {
                    // Select leaf mode between one of 8 childs based on childShift and childMask
                    normal = _octree[childOffset + parent +
                                     BitCount[((childMasks >> (8 + childShift)) << childShift) & 127]];

                    break;
                }

                rayStack[scale].offset = parent;
                rayStack[scale].maxT = maxT;

                // Calculate next node
                uint32 siblingCount = BitCount[childMasks & 127]; // calculate number of leafs? from child mask
                parent += childOffset + siblingCount;
                if (current & 0x10000)
                    parent += siblingCount;

                idx = 0;
                scale--;
                scaleExp2 = half;

                if (centerTX > minT) idx ^= 1, posX += scaleExp2;
                if (centerTY > minT) idx ^= 2, posY += scaleExp2;
                if (centerTZ > minT) idx ^= 4, posZ += scaleExp2;

                maxT = maxTV;
                current = 0;

                continue;
            }
        }

        int stepMask = 0;
        if (cornerTX <= maxTC) stepMask ^= 1, posX -= scaleExp2;
        if (cornerTY <= maxTC) stepMask ^= 2, posY -= scaleExp2;
        if (cornerTZ <= maxTC) stepMask ^= 4, posZ -= scaleExp2;

        minT = maxTC;
        idx ^= stepMask;

        if ((idx & stepMask) != 0) {
            int differingBits = 0;
            if (stepMask & 1) differingBits |= floatBitsToUint(posX) ^ floatBitsToUint(posX + scaleExp2);
            if (stepMask & 2) differingBits |= floatBitsToUint(posY) ^ floatBitsToUint(posY + scaleExp2);
            if (stepMask & 4) differingBits |= floatBitsToUint(posZ) ^ floatBitsToUint(posZ + scaleExp2);
            scale = (floatBitsToUint((float) differingBits) >> 23) - 127;
            scaleExp2 = uintBitsToFloat((scale - MaxScale + 127) << 23);

            parent = rayStack[scale].offset;
            maxT = rayStack[scale].maxT;

            int shX = floatBitsToUint(posX) >> scale;
            int shY = floatBitsToUint(posY) >> scale;
            int shZ = floatBitsToUint(posZ) >> scale;
            posX = uintBitsToFloat(shX << scale);
            posY = uintBitsToFloat(shY << scale);
            posZ = uintBitsToFloat(shZ << scale);
            idx = (shX & 1) | ((shY & 1) << 1) | ((shZ & 1) << 2);

            current = 0;
        }
    }

    if (scale >= MaxScale)
        return false;

    t = minT;
    return true;
}

/**
 * Serializa un octree y lo comprime en LZ4
 * @param path
 */
void VoxelOctree::save(const char *path) {
    FILE *fp = fopen(path, "wb");

    if (fp) {
        fwrite(&_center.x, sizeof(float), 1, fp);
        fwrite(&_center.y, sizeof(float), 1, fp);
        fwrite(&_center.z, sizeof(float), 1, fp);
        fwrite(&_octreeSize, sizeof(uint64), 1, fp);

        LZ4_stream_t *stream = LZ4_createStream();
        LZ4_resetStream(stream);

        std::unique_ptr<char[]> buffer(new char[LZ4_compressBound(CompressionBlockSize)]);
        const char *src = reinterpret_cast<char *>(_octree.get());

        uint64 compressedSize = 0;
        for (uint64 offset = 0; offset < _octreeSize * sizeof(uint32); offset += CompressionBlockSize) {
            int outSize = int(std::min(_octreeSize * sizeof(uint32) - offset, uint64(CompressionBlockSize)));
            uint64 compSize = LZ4_compress_continue(stream, src + offset, buffer.get(), outSize);

            fwrite(&compSize, sizeof(uint64), 1, fp);
            fwrite(buffer.get(), sizeof(char), size_t(compSize), fp);

            compressedSize += compSize + 8;
        }

        LZ4_freeStream(stream);

        fclose(fp);

        std::cout << "Octree size: " << prettyPrintMemory(_octreeSize * sizeof(uint32))
                  << " Compressed size: " << prettyPrintMemory(compressedSize) << std::endl;
    }
}

/**
 * Pretty prints the tree to a depth, showing information of each node
 */
void VoxelOctree::prettyPrintTree(uint32 maxDepth) {
    _prettyPrintNode(0, maxDepth, 0);
}

void VoxelOctree::prettyPrintTreeSequential(uint64 size) {

    for (uint64 i = 0; i < _octreeSize && i < size; ++i) {
        std::cout << i << "\t: " << nodeDetail(i) << std::endl;
    }

}


void VoxelOctree::_prettyPrintNode(uint64 nodeIndex, uint32 maxDepth, uint32 currentDepth) {

    uint32 &descriptor = _octree[nodeIndex];

    std::cout << nodeIndex << ":";
    // Pretty print the descriptor
    for (int i = 0; i < currentDepth; ++i) {
        std::cout << '\t';
    }
    std::cout << '\t';
    std::cout << '\t';

    // Unpack descriptor
    bool hasLargeChildren = (bool) (descriptor & 0x20000);
    bool isLargeNode = (bool) (descriptor & 0x10000);
    uint8 leafMask = (uint8) (descriptor & 0xFF);
    uint8 childMask = (uint8) ((descriptor & 0xFF00) >> 8);
    int childCount = BitCount[childMask & 255];
    uint64 childOffset = descriptor >> 18;
    if (hasLargeChildren)
        childOffset = (childOffset << 32) | uint64(_octree[nodeIndex + 1]);

    std::cout << nodeDetail(nodeIndex) << std::endl;

    if(leafMask == 0) {
//        for (int j = 0; j < childCount; ++j) {
//            for (int i = 0; i < currentDepth + 1; ++i) {
//                std::cout << '\t';
//            }
//            std::cout << descriptorToString(_octree[nodeIndex + childOffset]) << " (Leaf node)" << std::endl;
//        }
        for (int i = 0; i < currentDepth + 1; ++i) {
            std::cout << '\t';
        }
//        std::cout << childCount << " leaf nodes." << std::endl;
    } else {
        if (currentDepth < maxDepth) {
            for (int j = 0; j < childCount; ++j) {
                _prettyPrintNode(nodeIndex + childOffset + j, maxDepth, currentDepth + 1);
            }
        }
    }
}

/**
 * Pretty print of node descriptor
 * @param descriptor
 * @return
 */
std::string VoxelOctree::descriptorToString(uint32 &descriptor) {

    std::ostringstream oss;

    oss << std::bitset<14>(descriptor >> 18)
        << " " << std::bitset<1>(descriptor >> 17)
        << " " << std::bitset<1>(descriptor >> 16)
        << " " << std::bitset<8>(descriptor >> 8)
        << " " << std::bitset<8>(descriptor);

    return oss.str();
}

/**
 * Prints the details of a node by unpacking the information of its node descriptor
 * @param nodeIndex
 * @return
 */
std::string VoxelOctree::nodeDetail(uint64 nodeIndex) {

    uint32 &descriptor = _octree[nodeIndex];

    std::ostringstream oss;

    bool hasLargeChildren = (bool) (descriptor & 0x20000);
    bool isLargeNode = (bool) (descriptor & 0x10000);
    uint8 leafMask = (uint8) (descriptor & 0xFF);
    uint8 childMask = (uint8) ((descriptor & 0xFF00) >> 8);
    int childCount = BitCount[childMask & 255];
    uint64 childOffset = descriptor >> 18;
    if (hasLargeChildren)
        childOffset = (childOffset << 32) | uint64(_octree[nodeIndex + 1]);

    oss << std::bitset<14>(descriptor >> 18)
              << " " << std::bitset<1>(descriptor >> 17)
              << " " << std::bitset<1>(descriptor >> 16)
              << " " << std::bitset<8>(descriptor >> 8)
              << " " << std::bitset<8>(descriptor);
    oss << " [";
    if(hasLargeChildren) {
        oss << "FAR, ";
    }
    if(isLargeNode) {
        oss << "isLargeNode, ";
    }
    oss << "]";
    oss << " (" << childCount << " childs at " << nodeIndex << " + " << childOffset << " = " << nodeIndex + childOffset << ")";

    return oss.str();
}

