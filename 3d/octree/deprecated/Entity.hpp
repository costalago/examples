//
// Created by manuel on 11/10/16.
//

#ifndef PRUEBA_ENTITY_HPP
#define PRUEBA_ENTITY_HPP

#include "Mesh.hpp"

class Entity {

private:
    Mesh &mesh;

protected:

public:
    glm::mat4 modelMatrix;

    Entity(Mesh &mesh);

    ~Entity();

    void update(float dt);

    void render(glm::mat4 modelViewMatrix);

};

#endif //PRUEBA_ENTITY_HPP
