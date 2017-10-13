//
// Created by manuel on 12/25/16.
//

#ifndef PRUEBA_VOXELDATANOISE_HPP
#define PRUEBA_VOXELDATANOISE_HPP


#include "IVoxelData.hpp"
#include "../third-party/FastNoiseSIMD/FastNoiseSIMD/FastNoiseSIMD.h"

/**
 * Represents a 3D volume of fractal noise
 */
class VoxelDataNoise : public IVoxelData {

    FastNoiseSIMD *noiseGenerator;
    float *noise;
    uint32 _size;

public:

    VoxelDataNoise(uint32 _size);
    ~VoxelDataNoise();
    uint32 getVoxel(int x, int y, int z) const override;
    uint32 getVoxelDestructive(int x, int y, int z) override;
    bool cubeContainsVoxelsDestructive(int x, int y, int z, int size) override;
    void prepareDataAccess(int x, int y, int z, int size) override;
    int sideLength() const override;
    glm::vec3 getCenter() const override;
};


#endif //PRUEBA_VOXELDATANOISE_HPP
