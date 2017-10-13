//
// Created by manuel on 11/17/16.
//

#ifndef CUBE_HPP
#define CUBE_HPP

#include <GL/glew.h>
#include "../shader/Shader.hpp"

/**
 * This class represents a renderable object. It has a VAO and
 * several vertex and element buffers as well as a shader. It doesn't
 * know anything about world position or orientation. Those things are
 * handled by the Entity class
 */
class Cube {

private:

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

    Cube();

    ~Cube();

    /**
     * Renders the mesh by using the passed model view projection matrix
     * @param projectionViewMatrix model view projection matrix, it usually comes from a composition of
     * the model view matrix (from the camera) and the model matrix (from the entity location)
     */
    void render(glm::mat4 projectionViewMatrix);

    void update(float dt);
};


#endif //CUBE_HPP
