#version 330 core

layout(location = 0) in vec3 position;
// Notice that the "1" here equals the "1" in glVertexAttribPointer
layout(location = 1) in vec3 color;

// Output data ; will be interpolated for each fragment.
out vec3 fragmentColor;

// Values that stay constant for the whole mesh.
uniform mat4 projectionViewModel;

void main(){
    // Output position of the vertex, in clip space : MVP * position
    gl_Position =  projectionViewModel * vec4(position,1);

    // The color of each vertex will be interpolated
    // to produce the color of each fragment
    fragmentColor = color;
}
