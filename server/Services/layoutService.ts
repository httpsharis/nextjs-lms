import LayoutModel from "../Models/layoutModel"


export const createLayoutService = async (data: any) => {
    const layout = await LayoutModel.create(data)
    return layout
}