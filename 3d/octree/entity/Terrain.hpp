//
// Created by manuel on 12/16/16.
//

#ifndef PRUEBA_TERRAIN_HPP
#define PRUEBA_TERRAIN_HPP


#include <GL/glew.h>
#include <glm/detail/type_mat.hpp>
#include <glm/detail/type_mat4x4.hpp>
#include <glm/gtc/matrix_transform.hpp>
#include "../octree/Octree.hpp"
#include "../shader/Shader.hpp"
#include "../svo/ChunkedAllocator.hpp"
#include "../svo/IVoxelData.hpp"
#include "../svo/VoxelOctree.hpp"

/**
 *
 *
 */
class Terrain {

private:

    // Terrain
    int depth;
    std::unique_ptr<VoxelOctree> _octree;
    std::unique_ptr<IVoxelData> noiseData;

    // Rendering
    Shader shader;
    GLuint idVao;
    GLuint idBufferVertices;
    GLuint idBufferIndices;

    // cube instance mesh data
    static const GLfloat vertices[];
    static const GLuint indices[];
    static const int verticesSize;
    static const int indicesSize;
    int render_count = 0;

    void _renderOctree(uint64 nodeIndex, uint32 nodex, uint32 nodey, uint32 nodez,
                       glm::mat4& projectionViewMatrix, int current_depth, int renderLevel);

public:

    Terrain(int depth);
    ~Terrain();
    void render(glm::mat4 projectionViewMatrix, int renderLevel);
    void update(float dt);
};


#endif //PRUEBA_TERRAIN_HPP
