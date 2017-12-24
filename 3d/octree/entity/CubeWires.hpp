//
// Created by manuel on 12/7/16.
//

#ifndef PRUEBA_CUBEWIRES_HPP
#define PRUEBA_CUBEWIRES_HPP


#include <glm/detail/type_mat.hpp>
#include <glm/detail/type_mat4x4.hpp>
#include <GL/glew.h>
#include "../shader/Shader.hpp"

class CubeWires {

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

    // model matrix
    glm::mat4 modelMatrix;

    CubeWires();

    ~CubeWires();

    /**
     * Renders the mesh by using the passed model view projection matrix
     * @param projectionViewMatrix model view projection matrix, it usually comes from a composition of
     * the model view matrix (from the camera) and the model matrix (from the entity location)
     */
    void render(glm::mat4 projectionViewMatrix);

    void update(float dt);
};


#endif //PRUEBA_CUBEWIRES_HPP
