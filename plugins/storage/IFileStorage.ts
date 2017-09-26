export interface IFileData{
    name:string,
    size:number,
    data: any,
    type:string
}

export interface IFileStorage {
    getById(id:string): Promise<IFileData>
}