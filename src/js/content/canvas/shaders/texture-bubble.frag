// Three.jsと競合するので一部処理はコメントアウト
// #version 300 es

precision highp float;
precision highp sampler2DArray;

// ShaderMaterial生成時に追加
// #define BALL_COUNT ${objectControllers.length}

in vec2 vUv;

uniform vec2 uResolution;
uniform sampler2DArray uTextures;
uniform int uObjectCount;

struct Ball {
    vec2 coordinates;
    float size;
    float scale;
    float opacity;
};

uniform Ball uObjects[BALL_COUNT];

out vec4 outColor;

void main() {

    // 0～100座標
    vec2 uv = vUv * 100.0;

    float aspect = uResolution.x / uResolution.y;
    uv.x *= aspect;

    vec4 color = vec4(0.0);

    // ライト方向
    vec3 lightDir = normalize(vec3(-0.4, 0.6, 1.0));
    vec3 viewDir  = vec3(0.0, 0.0, 1.0);

    for (int i = 0; i < BALL_COUNT; i++) {

        if (i >= uObjectCount) {
            break;
        }

        Ball object = uObjects[i];

        vec2 center = object.coordinates;
        center.x *= aspect;

        float radius = object.size * object.scale;

        vec2 delta = uv - center;
        float d = length(delta);

        if (d <= radius) {

            // テクスチャ用UV
            vec2 localUv = delta / (radius * 2.0) + 0.5;
            localUv = clamp(localUv, 0.0, 1.0);

            vec4 tex = texture(
                uTextures,
                vec3(localUv, float(i))
            );

            //=========================
            // 球面法線を計算
            //=========================

            // -1～1
            vec2 p = delta / radius;

            float r2 = dot(p, p);

            // 球の表面(z)
            float z = sqrt(max(0.0, 1.0 - r2));

            // 球の法線
            vec3 normal = normalize(vec3(p, z));

            //=========================
            // ライティング
            //=========================

            float ambient = 0.25;

            float diffuse = max(dot(normal, lightDir), 0.0);

            vec3 reflectDir = reflect(-lightDir, normal);

            float specular = pow(
                max(dot(viewDir, reflectDir), 0.0),
                64.0
            );

            vec3 lighting =
                tex.rgb * (ambient + diffuse * 0.75)
                + vec3(specular);

            color = vec4(
                lighting,
                tex.a * object.opacity
            );

            break;
        }
    }

    outColor = color;
}