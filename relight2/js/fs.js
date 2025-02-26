var fs_src = `
    precision highp float;

    const vec3 diffuseColor = vec3(1.0, 1.0, 1.0);
    const vec3 specColor = vec3(1.0, 1.0, 1.0);

    uniform vec3 lightPos;
    uniform sampler2D texSampler;
    uniform int textureLighting;
    uniform float lightIntensity;

    varying vec3 fPos;
    varying vec3 fNormal;
    varying vec2 texCoords;

    vec3 normal;

    vec3 calculate_lighting() {
        vec3 lightDir = fPos - lightPos;
        float distance = length(lightDir);
        if (distance >= 1.0) {
            distance = distance * distance;
        } else {
            distance = pow(distance, 0.5);
        }
        lightDir = normalize(lightDir);
    
        float lambertian = max(dot(lightDir, normal), 0.0);
        vec3 diffuse = diffuseColor * lambertian / distance;

        float specularCoeff = 0.0;
        if (lambertian > 0.0) {
            vec3 viewDir = normalize(fPos);
            vec3 halfDir = normalize(lightDir + viewDir);
            
            float specAngle = max(dot(halfDir, normal), 0.0);
            specularCoeff = pow(specAngle, 1.0);
        }
        vec3 specular = specularCoeff * specColor / distance;

        vec3 color = diffuse + specular;
        return color;
    }

    void main() {
        normal = normalize(fNormal);
        vec3 color = calculate_lighting();
        vec4 texColor = texture2D(texSampler, texCoords);
        
        if (textureLighting == 1) {
            gl_FragColor = texColor;
        } else if (textureLighting == 2) {
            gl_FragColor = vec4(lightIntensity * color, 1.0);
        } else if (textureLighting == 3) {
            // gl_FragColor = texColor + vec4(lightIntensity * texColor.xyz * color, 0.0);
            vec3 original_color_linear = texColor.xyz ;
            vec3 original_light_linear =  lightIntensity * color * texColor.xyz
            vec3 blend_color = ( original_color_linear + original_light_linear ) / 2.0;
            gl_FragColor = vec4(blend_color, texColor.w);
            // vec3 original_color_linear = texColor.xyz / 255.0;
            // vec3 original_light_linear =  lightIntensity * color * texColor.xyz / 255.0;
            // vec3 new_color_linear = (original_color_linear + original_light_linear) / 2.0;
            // vec3 scale_light_linear = min(max(new_color_linear, 0.0) , 1.0);
            // float sx = pow(scale_light_linear.x , 1.0 / 2.2);
            // float sy = pow(scale_light_linear.y , 1.0 / 2.2);
            // float sz = pow(scale_light_linear.z , 1.0 / 2.2);
            // vec3 scale_light_linear_1 = vec3(sx , sy, sz);
            // vec3 new_tex_color = scale_light_linear_1 * 255.0;
            // new_tex_color = min(max(new_tex_color, 0.0) , 255.0);
            // gl_FragColor = vec4(new_tex_color , texColor.w);
            // // gl_FragColor = texColor + vec4(scale_light_linear * texColor.xyz, 0.0);
        }
    }
`;