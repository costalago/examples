//
// Created by manuel on 12/25/16.
//

#ifndef PRUEBA_IVOXELDATA_HPP
#define PRUEBA_IVOXELDATA_HPP

#include <glm/vec3.hpp>
#include "IntTypes.hpp"

class IVoxelData {

public:
    virtual uint32 getVoxel(int x, int y, int z) const = 0;
    virtual uint32 getVoxelDestructive(int x, int y, int z) = 0;
    virtual bool cubeContainsVoxelsDestructive(int x, int y, int z, int size) = 0;
    virtual void prepareDataAccess(int x, int y, int z, int size) = 0;
    virtual int sideLength() const = 0;
    virtual glm::vec3 getCenter() const = 0;

};

#endif //PRUEBA_IVOXELDATA_HPP
