import fs from 'fs';

class FileOperations{

    constructor(destPath, readPath){
        this.destPath = destPath;
        this.readPath = readPath;
    }

    read(path){
        if (!fs.existsSync(this.readPath)){
            throw new Error('Arquivo não encontrado!');
        }
        return fs.readFileSync(this.readPath, 'utf-8');
    }

    write(filename, content){
        if(!fs.existsSync(this.destPath.split('/')[1])){
            fs.mkdirSync(this.destPath.split('/')[1]);
        }
        
        fs.writeFileSync(`${this.destPath}/${filename}`, content);
    }
    
}

export default FileOperations;