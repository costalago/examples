//
// Created by manuel on 11/22/16.
//

#ifndef CHUNK_HPP
#define CHUNK_HPP

#include <vector>
#include <glm/detail/type_mat.hpp>
#include <glm/detail/type_mat4x4.hpp>
#include "Entity.hpp"

class Chunk {
private:
    // Width of the chunk
//    static const int width = 100;

    // Rendering stuff
    Shader shader;
    GLuint idVao;
    GLuint idBufferVertices;
    GLuint idBufferIndices;
    GLuint idBufferPositions;

    // Geometry data, vertices, indices, per instance displacements
    static const GLfloat vertices[];
    static const GLuint indices[];
    static const int verticesSize;
    static const int indicesSize;
    std::vector<glm::vec3> positions;

    /**
     * Returns the number of resolutions available for the width of the chunk.
     * The width of the chunk is the number of 1 unit blocks allowed inside accross one dimension
     *
     * @param width
     * @return
     */
    static int resolutionsForWidth(const int width);

    /**
     * Returns the number of blocks that fit accross one dimension for a given resolution
     * @param resolution
     * @param width
     * @return
     */
    static int blocksForResolutionAndWidth(const int resolution, const int width);

    static float noiseOffset(const int resolution, const int block);

protected:
public:
    // model matrix
    glm::mat4 instanceModelMatrix;
    glm::mat4 modelMatrix;

    Chunk(int resolution, int width, int chunkx, int chunky, int chunkz);

    ~Chunk();

    /**
    * Renders the mesh by using the passed model view projection matrix
    * @param projectionViewMatrix model view projection matrix, it usually comes from a composition of
    * the model view matrix (from the camera) and the model matrix (from the entity location)
    */
    void render(glm::mat4 projectionViewMatrix);

    void update(float dt);
};


#endif //CHUNK_HPP
