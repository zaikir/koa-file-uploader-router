import path from 'path';
import FileModel from '../models';
import get from './get';
import upload from './upload';

export default ({
  Router, mongoose, prefix, fullPrefix,
  modelName = 'File',
  uploadsFolder = path.resolve('uploads'),
  allowedFormats = '*', roles,
  getRole = ({ user: { role } }) => role,
  defaultMiddleware = async (ctx, next) => { await next(); },
  notFoundMiddleware,
  middleware = {},
}) => {
  const router = new Router({
    prefix,
  });

  const parseRoles = () => {
    if (typeof roles === 'string') {
      return roles.split(',');
    }
    return roles;
  };

  const authMiddleware = roles
    ? async (ctx, next) => {
      if (parseRoles().includes(getRole(ctx))) {
        await next();
      } else {
        ctx.status = 403;
      }
    }
    : async (ctx, next) => { await next(); };

  const model = FileModel({ mongoose, modelName });

  const getRoute = get({
    model, mongoose, uploadsFolder, notFoundMiddleware,
  });

  router.get('/:transformString/:id.:format', authMiddleware, middleware.get || defaultMiddleware, getRoute);
  router.get('/:transformString/:id', authMiddleware, middleware.get || defaultMiddleware, getRoute);
  router.get('/:id.:format', authMiddleware, middleware.get || defaultMiddleware, getRoute);
  router.get('/:id', authMiddleware, middleware.get || defaultMiddleware, getRoute);

  router.post('/', authMiddleware, middleware.upload || defaultMiddleware,
    upload({
      model, fullPrefix: fullPrefix || `/api/${prefix}`, allowedFormats, uploadsFolder,
    }));

  return router;
};
