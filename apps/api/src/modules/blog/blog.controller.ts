import type { Request, Response, NextFunction } from 'express';
import { blogService } from './blog.service';
import { sendSuccess, sendMessage } from '@/utils/response';

export async function listPosts(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await blogService.listPosts(req.query);
    sendSuccess(res, { posts: result.posts, meta: result.meta });
  } catch (err) {
    next(err);
  }
}

export async function getPost(req: Request, res: Response, next: NextFunction) {
  try {
    const post = await blogService.getPost(req.params.slug as string);
    sendSuccess(res, post);
  } catch (err) {
    next(err);
  }
}

export async function getPostById(req: Request, res: Response, next: NextFunction) {
  try {
    const post = await blogService.getPostById(req.params.id as string);
    sendSuccess(res, post);
  } catch (err) {
    next(err);
  }
}

export async function createPost(req: Request, res: Response, next: NextFunction) {
  try {
    const post = await blogService.createPost(req.user!, req.body);
    sendSuccess(res, post, undefined, 201);
  } catch (err) {
    next(err);
  }
}

export async function updatePost(req: Request, res: Response, next: NextFunction) {
  try {
    const post = await blogService.updatePost(req.params.id as string, req.user!, req.body);
    sendSuccess(res, post);
  } catch (err) {
    next(err);
  }
}

export async function deletePost(req: Request, res: Response, next: NextFunction) {
  try {
    await blogService.deletePost(req.params.id as string, req.user!);
    sendMessage(res, 'Post deleted successfully');
  } catch (err) {
    next(err);
  }
}
