import getMany from './getMany';
import get from './get';
import count from './count';
import counts from './counts';
import create from './create';
import update from './update';
import remove from './remove';

export default ({
  Router, model, prefix, briefColumns,
  searchQuery, preCreate, postCreate,
  preUpdate, postUpdate, removedKey,
  roles, getRole = ({ user: { role } }) => role,
  defaultMiddleware = async (ctx, next) => { await next(); },
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


  router.get('/', authMiddleware, middleware.getMany || defaultMiddleware, getMany({ model, briefColumns, searchQuery }));
  router.get('/count', authMiddleware, middleware.count || defaultMiddleware, count({ model, searchQuery }));
  router.post('/count', authMiddleware, middleware.count || defaultMiddleware, counts({ model, searchQuery }));
  router.get('/:id', authMiddleware, middleware.get || defaultMiddleware, get({ model }));
  router.post('/', authMiddleware, middleware.create || defaultMiddleware, create({ model, preCreate, postCreate }));
  router.put('/', authMiddleware, middleware.update || defaultMiddleware, update({ model, preUpdate, postUpdate }));
  router.delete('/:id', authMiddleware, middleware.remove || defaultMiddleware, remove({ model, removedKey }));

  return router;
};
