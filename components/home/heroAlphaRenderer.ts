/** Reconstruct transparency from an H.264 frame: RGB on the left, alpha on the right. */
export function createHeroAlphaRenderer(canvas: HTMLCanvasElement) {
    const gl = canvas.getContext('webgl', { alpha: true, premultipliedAlpha: false, preserveDrawingBuffer: true });
    if (!gl) throw new Error('WebGL unavailable');
    const compile = (type: number, source: string) => {
        const shader = gl.createShader(type)!;
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            gl.deleteShader(shader);
            throw new Error('Hero shader unavailable');
        }
        return shader;
    };
    const vertex = compile(gl.VERTEX_SHADER, `attribute vec2 position; varying vec2 uv;
        void main(){gl_Position=vec4(position,0.,1.);uv=vec2((position.x+1.)*.5,(1.-position.y)*.5);}`);
    const fragment = compile(gl.FRAGMENT_SHADER, `precision highp float;
        uniform sampler2D frame; varying vec2 uv;
        void main(){
            vec2 p=vec2((uv.x*1279.+.5)/2560.,(uv.y*719.+.5)/720.);
            vec3 rgb=texture2D(frame,p).rgb;
            float alpha=texture2D(frame,p+vec2(.5,0.)).r;
            gl_FragColor=vec4(rgb,clamp((alpha-.004)/.992,0.,1.));
        }`);
    const program = gl.createProgram()!;
    gl.attachShader(program, vertex); gl.attachShader(program, fragment); gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error('Hero shader unavailable');
    gl.useProgram(program);
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,1,-1,-1,1,1,1]), gl.STATIC_DRAW);
    const position = gl.getAttribLocation(program, 'position');
    gl.enableVertexAttribArray(position); gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.uniform1i(gl.getUniformLocation(program, 'frame'), 0);
    canvas.width = 1280; canvas.height = 720;
    gl.viewport(0, 0, canvas.width, canvas.height);
    return {
        draw(video: HTMLVideoElement, verify = false) {
            if (gl.isContextLost()) throw new Error('Hero graphics context lost');
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, video);
            gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
            if (gl.getError() !== gl.NO_ERROR) throw new Error('Hero frame unavailable');
            if (verify) {
                // Verify the reconstructed canvas, not just MP4 codec support.
                const pixels = new Uint8Array(canvas.width * canvas.height * 4);
                gl.readPixels(0, 0, canvas.width, canvas.height, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
                const corners = [0, canvas.width-1, (canvas.height-1)*canvas.width, canvas.width*canvas.height-1];
                if (!corners.every(i => pixels[i*4+3] < 16) || !pixels.some((v,i) => i%4===3 && v>240)) {
                    throw new Error('Hero transparency unavailable');
                }
            }
        },
        dispose() {
            gl.deleteTexture(texture); gl.deleteBuffer(buffer); gl.deleteProgram(program);
            gl.deleteShader(vertex); gl.deleteShader(fragment);
        },
    };
}
