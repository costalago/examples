#version 330 core

layout(location = 0) in vec3 position;
//layout(location = 1) in vec3 normal;
layout(location = 1) in vec3 color;

// instanced attribute, only changes once for each instance
layout(location = 2) in vec3 offset;

// Output data ; will be interpolated for each fragment.
out vec3 fragmentColor;

// Camera transformation
uniform mat4 projectionView;
// Bigger model transformations
uniform mat4 model;
// Instance transformations
uniform mat4 instanceModel;

void main(){
    // first appy the model transformations, then the per instance offset and then the
    // camera transformation and projection
    gl_Position = projectionView * model * ((instanceModel * vec4(position,1)) + vec4(offset, 0));

    // The color of each vertex will be interpolated
    // to produce the color of each fragment
    fragmentColor = color;
}
