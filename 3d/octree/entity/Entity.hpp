//
// Created by manuel on 11/10/16.
//

#ifndef PRUEBA_ENTITY_HPP
#define PRUEBA_ENTITY_HPP

#include "Cube.hpp"

class Entity {

private:


protected:

public:
    Cube &mesh;
    glm::mat4 modelMatrix;

    Entity(Cube &mesh);

    ~Entity();

    void update(float dt);

    void render(glm::mat4 modelViewMatrix);

};

#endif //PRUEBA_ENTITY_HPP
