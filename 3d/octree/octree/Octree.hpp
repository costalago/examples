//
// Created by manuel on 12/7/16.
//

#ifndef PRUEBA_OCTREE_HPP
#define PRUEBA_OCTREE_HPP

#include <cmath>
#include <bits/unique_ptr.h>
#include <iostream>
#include "../math/PerlinNoise.hpp"
#include "../svo/IntTypes.hpp"
#include "../third-party/FastNoiseSIMD/FastNoiseSIMD/FastNoiseSIMD.h"

struct OctreeData {
    bool solid;
};

/**
 * Generates an octree from simplex noise
 */
class Octree {

private:
    OctreeData data;
protected:

public:
    //TODO: make private in some way
    std::unique_ptr<Octree> childs[8] = {nullptr, nullptr, nullptr, nullptr, nullptr, nullptr, nullptr, nullptr};

    Octree(OctreeData data) : data(data) {

    }

    // We can't copy construct a unique_ptr so the default generated copy constructor can't be built
    // we have to define it explicitly here and it moves the pointer instead of copyting it.
    // http://stackoverflow.com/questions/15032501/stdunique-ptr-deleted-function-initializer-list-driven-allocation
    Octree(Octree &f);

    /**
     * Generates perlin noise, then builds octree recursively
     * @param width
     * @return
     */
    static std::unique_ptr<Octree> buildVoxelOctree(int width) {

        const double sampling_period = 1.0f / 60.0f; // Higher values means more zooming out in the noise

        std::vector<bool> voxels(width * width * width);

        FastNoiseSIMD *noiseSIMD = FastNoiseSIMD::NewFastNoiseSIMD();
        std::cout << "FastNoiseSIMD initialized" << std::endl;
        std::cout << "SIMD Level: " << noiseSIMD->GetSIMDLevel() << std::endl;
        float *noisez = noiseSIMD->GetSimplexFractalSet(0, 0, 0, width, width, width, 1);

        int index = 0;

        // Generate basic noise
        for (int y = 0; y < width; y++) {
            for (int z = 0; z < width; z++) {
                for (int x = 0; x < width; x++) {
                    float noise = noisez[index++];

                    if (noise > 0.6) {

                        voxels[x + z * width + y * width * width] = 1;
                    } else {
                        voxels[x + z * width + y * width * width] = 0;
                    }
                }
            }
        }

        noiseSIMD->FreeNoiseSet(noisez);

        OctreeData data{true};
        std::unique_ptr<Octree> octree(new Octree(data));
        Octree::_buildOctree(*octree, 0, 0, 0, 0, voxels, width);
        return octree;
    }

    /**
     * Builds an octree recursively given a vector of voxels and a node in space. It will then
     * divide the given node into 8 child octants, for each child octant it will check if they are empty,
     * full or partially filled by looking at the corresponding voxels. Empty and full octants arent subdivided and
     * thus are leaf nodes.
     * @param node The root node
     * @param level The recursion level, starts at 0, ends at log2(voxels_width)
     * @param nodex The x position of the processed node in the noise space
     * @param nodey The y position of the processed node in the noise space
     * @param nodez The z position of the processed node in the noise space
     * @param voxels The voxel collection with voxels laid out using this dimension preference: X Y Z
     * @param voxels_width The voxel data width
     */
    void static _buildOctree(Octree &node, const int level, const int nodex, const int nodey,
                             const int nodez, const std::vector<bool> &voxels, const int voxels_width) {

        // Maximum depth of the octree, depends on how wide the voxels block is
        int max_level = std::log2(voxels_width);

        // Width in voxels of this level's octants
        int octant_voxels_width = std::pow(2, std::log2(voxels_width) - level) / 2;

        // 0 = vacio, 1 = no vacio, 2 = lleno
        int octant_state[8] = {0, 0, 0, 0, 0, 0, 0, 0};

        // find if the childs have any voxels on them
        for (int i_octant = 0; i_octant < 8; i_octant++) {
            int octantx = (i_octant % 2) * octant_voxels_width + nodex;
            int octanty = (i_octant > 3) * octant_voxels_width + nodey;
            int octantz =
                    (i_octant == 2 || i_octant == 3 || i_octant == 6 || i_octant == 7) * octant_voxels_width + nodez;

            bool octant_empty = true;
            bool octant_full = true;

            // Check if the octant is empty by looking for every voxel inside it
            for (int y = 0; y < octant_voxels_width; y++) {
                for (int z = 0; z < octant_voxels_width; z++) {
                    for (int x = 0; x < octant_voxels_width; x++) {
                        octant_empty &= !voxels[(octantx + x) + (octantz + z) * voxels_width +
                                                                        (octanty + y) * voxels_width * voxels_width];
                        octant_full &= voxels[(octantx + x) + (octantz + z) * voxels_width +
                                              (octanty + y) * voxels_width * voxels_width];
                    }
                }
            }

            if(octant_empty) {
                octant_state[i_octant] = 0;
            } else if(octant_full) {
                octant_state[i_octant] = 2;
            } else {
                octant_state[i_octant] = 1;
            }

            // Fill childs, only if they aren't octant_empty
            if (octant_empty) {
                node.childs[i_octant] = nullptr;
            } else {
                OctreeData data{true};
                node.childs[i_octant] = std::unique_ptr<Octree>(new Octree(data));
            }
        }

        // build child octants
        for (int i_octant = 0; i_octant < 8; i_octant++) {
            int octantx = (i_octant % 2) * octant_voxels_width + nodex;
            int octanty = (i_octant > 3) * octant_voxels_width + nodey;
            int octantz =
                    (i_octant == 2 || i_octant == 3 || i_octant == 6 || i_octant == 7) * octant_voxels_width + nodez;

            // process octant only if it isn't empty or full
            if (node.childs[i_octant] != nullptr && octant_state[i_octant] != 2) {
                _buildOctree(*node.childs[i_octant], level + 1, octantx, octanty, octantz, voxels, voxels_width);
            }
        }
    }
};

#endif //PRUEBA_OCTREE_HPP
