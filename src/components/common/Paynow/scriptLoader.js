const scriptLoader = (id, path, callback) => {
    const existingScript = document.getElementById(id);
    if (!existingScript) {
        const script = document.createElement('script');
        script.src = path;
        script.id = id;
        document.body.appendChild(script);
        script.onload = () => {
            if (callback) callback();
        };
    }
    if (existingScript && callback) callback();
};

export default scriptLoader;
