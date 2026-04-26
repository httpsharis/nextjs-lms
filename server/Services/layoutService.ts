import { Types } from "mongoose"
import LayoutModel from "../Models/layoutModel"


export const createLayoutService = async (data: any) => {
    const layout = await LayoutModel.create(data)
    return layout
}

export const updateLayoutService = async (id: string | Types.ObjectId, data: any) => {
    const layout = await LayoutModel.findByIdAndUpdate(id, data, { new: true })
    return layout
}