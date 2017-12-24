//
// Created by manuel on 11/17/16.
//

#ifndef PRUEBA_MESH_HPP
#define PRUEBA_MESH_HPP

#include <GL/glew.h>

/**
 * This class represents a renderable object. It has a VAO and
 * several vertex and element buffers as well as a shader. It doesn't
 * know anything about world position or orientation. Those things are
 * handled by the Entity class
 */
class Mesh {

private:
    // TEMPORAL: Shader program & mvp matrix id, this will be in its own shader
    // object in the future
    GLuint programID;
    GLuint vertexArrayID;
    GLuint vertexBuffer;
    GLuint colorBuffer;

protected:
public:

    // TEMPORAL: Shader program & mvp matrix id, this will be in its own shader
    // object in the future
    GLint mvpMatrixId;

    // Vertex and color data, in the future this will be loaded from a file
    static const GLfloat vertexData[];
    static const GLfloat colorData[];
    static const int vertexSize;
    static const int colorSize;

    Mesh();

    ~Mesh();

    /**
     * Renders the mesh by using the passed model view projection matrix
     * @param mvp model view projection matrix, it usually comes from a composition
     * the model view matrix (from the camera) and the model matrix (from the entity location)
     */
    void render(glm::mat4 mvp);

};


#endif //PRUEBA_MESH_HPP
