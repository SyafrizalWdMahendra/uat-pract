import {Request, Response , NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import multer from 'multer';


const upload = multer({ dest: 'uploads/' });

const prisma = new PrismaClient();

export const getItems = async (req: Request, res: Response) => {
  try {
    const { number_info, page = 1, limit = 10 } = req.query as { number_info?: string, page?: string, limit?: string };

    let filteredItems = await prisma.featureManagement.findMany({
      where: {
        number_info: number_info ? { contains: number_info } : undefined,
        deleted_at: null, // Pastikan hanya mengambil item yang belum dihapus
      },
    });

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const start = (pageNum - 1) * limitNum;
    const end = start + limitNum;

    res.json({
      total: filteredItems.length,
      page: pageNum,
      limit: limitNum,
      data: filteredItems.slice(start, end),
    });
  } catch (error) {
    console.error(error); // ⬅️ Supaya error detail muncul di terminal
    res.status(500).json({ message: "Something went wrong!", error });
  }
};

export const createItem = async (req: Request, res: Response) => {
  // upload.single('image')(req, res, async (err) => {
    // if (err) {
    //   return res.status(500).json({ message: 'File upload failed', error: err.message });
    // }
  
  const { number_info, text,image, background, image_position } = req.body;
  // Validasi data yang diterima dari request body
  if (!number_info || !text) {
    return res.status(400).json({ message: 'number_info and text are required' });
  }
  
  try
  {
  const newItem =  await prisma.featureManagement.create({
    data: {
      number_info,
      text,
      image,
      background,
      image_position

    },
  });
  
  res.status(201).json(newItem);
  }
  catch (error) {
    console.error(error); // ⬅️ Supaya error detail muncul di terminal
    res.status(500).json({ message: "Something went wrong!", error });
  }
// });
};

// Update item
export const updateItem = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { number_info, text } = req.body;

    const item = await prisma.featureManagement.findUnique({
      where: { id: parseInt(id, 10) },
    });
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

     const updatedFeature = await prisma.featureManagement.update({
      where: { id: parseInt(id, 10) }, // Menggunakan id sebagai identifikasi unik untuk item yang ingin diupdateid },
      data: {
        number_info: number_info,
        text: text,

      },
    });
    return updatedFeature;

    // Kembalikan item yang sudah diupdate
    return res.status(200).json(item);
  } catch (error) {
    next(error);  // Mengirimkan error ke middleware error-handling
  }
};




export const deleteItem = async (req: Request, res: Response) => {
  const { id } = req.params;

   const deletedFeature = await prisma.featureManagement.delete({
      where: { id: parseInt(id, 10) }, // Menggunakan id sebagai identifikasi unik untuk item yang ingin diupdateid },
    });

    return res.json({ message: 'Delete item' , deletedFeature });
};

