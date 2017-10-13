//
// Created by manuel on 11/27/16.
//

#ifndef PRUEBA_SHADERR_HPP
#define PRUEBA_SHADERR_HPP

#include <string>
#include <fstream>
#include <sstream>
#include <iostream>

#include <GL/glew.h>

class Shader {
public:

    GLuint program;

    // Constructor generates the shader on the fly
    Shader(const GLchar *vertexPath, const GLchar *fragmentPath);

    ~Shader();

    // Uses the current shader
    void use();
};

#endif //PRUEBA_SHADERR_HPP