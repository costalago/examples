//
// Created by manuel on 12/25/16.
//

#include <algorithm>
#include "VoxelDataNoise.hpp"

VoxelDataNoise::VoxelDataNoise(uint32 size) : _size(size) {

    noiseGenerator = FastNoiseSIMD::NewFastNoiseSIMD();
    noise = noiseGenerator->GetSimplexFractalSet(0, 0, 0, _size, _size, _size);
}

uint32 VoxelDataNoise::getVoxel(int x, int y, int z) const {
    return (uint32)(noise[x + z*_size + y*_size*_size] > 0.4f);
}

uint32 VoxelDataNoise::getVoxelDestructive(int x, int y, int z) {
    return getVoxel(x, y, z);
}

bool VoxelDataNoise::cubeContainsVoxelsDestructive(int x0, int y0, int z0, int size) {
    bool empty = true;
    for (int y = y0; y < y0 + size; ++y) {
        for (int z = z0; z < z0 + size; ++z) {
            for (int x = x0; x < x0 + size; ++x) {
                empty &= !getVoxel(x, y, z);
            }
        }
    }
    return !empty;
}

void VoxelDataNoise::prepareDataAccess(int x, int y, int z, int size) {

}

int VoxelDataNoise::sideLength() const {
    return _size;
}

glm::vec3 VoxelDataNoise::getCenter() const {
    return glm::vec3(
            _size*0.5f/sideLength(),
            _size*0.5f/sideLength(),
            _size*0.5f/sideLength()
    );
}

VoxelDataNoise::~VoxelDataNoise() {
    noiseGenerator->FreeNoiseSet(noise);
}


