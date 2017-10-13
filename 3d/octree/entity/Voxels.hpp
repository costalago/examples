//
// Created by manuel on 12/10/16.
//

#ifndef PRUEBA_VOXELS_HPP
#define PRUEBA_VOXELS_HPP


#include <glm/vec3.hpp>
#include <vector>
#include <glm/detail/type_mat.hpp>
#include <glm/detail/type_mat4x4.hpp>
#include "../shader/Shader.hpp"
#include "../octree/Octree.hpp"

/**
 * Voxel octree implementation
 */
class Voxels {

    // Voxel data
    int width;
    int levels;
    std::unique_ptr<Octree> voxelOctree;

    // Rendering
    Shader shader;
    GLuint idVao;
    GLuint idBufferVertices;
    GLuint idBufferIndices;

    // Mesh data
    static const GLfloat vertices[];
    static const GLuint indices[];
    static const int verticesSize;
    static const int indicesSize;

protected:
public:

    glm::mat4 modelMatrix; // general voxel octree model matrix

    Voxels(Voxels&& f);

    Voxels(int width);

    ~Voxels();

    /**
    * Renders the mesh by using the passed model view projection matrix
    * @param projectionViewMatrix model view projection matrix, it usually comes from a composition of
    * the model view matrix (from the camera) and the model matrix (from the entity location)
    */
    void render(glm::mat4 projectionViewMatrix);

    void _renderNode(
            Octree& octree, glm::mat4 projectionViewMatrix, int level, int nodex, int nodey,
            int nodez, int draw_level);

    void update(float dt);
};


#endif //PRUEBA_VOXELS_HPP
