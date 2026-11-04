import { archiveDataById } from "./archiveDataById.js";
import { createData } from "./createData.js";
import { getAllData } from "./getAllData.js";
import { getDataById } from "./getDataById.js";
import { updateDataById } from "./updateDataById.js";

const crudRoutesWithControllers = ({ routes, routeName, Model, configs }) => {
  // Check if extraQuery exists in the config, otherwise fallback to empty object

  // GET route - Fetch all data
  routes.route(`/${routeName}`).get(async (req, res) => {
    try {
      const extraKey = configs?.extraQueryField; // old name you used
      // Look for the extra query value in both query string and route params
      const extraQueryValue = extraKey
        ? req.query[extraKey] ?? req.params[extraKey]
        : undefined;
      const extraQuery = extraQueryValue ? { [extraKey]: extraQueryValue } : {};

      const result = await getAllData({
        model: Model,
        req,
        res,
        extraQuery,
        ...configs,
      });
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // POST route - Create new data
  routes.route(`/${routeName}`).post(async (req, res) => {
    try {
      const extraKey = configs?.extraQueryField;
      const extraQueryValue = extraKey ? req.query[extraKey] ?? req.params[extraKey] : undefined;
      const result = await createData({ model: Model, req, res, extraKey, extraQueryValue });
      res.status(201).json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // GET route - Fetch single data by ID
  routes.route(`/${routeName}/:id`).get(async (req, res) => {
    try {
      const extraKey = configs?.extraQueryField;
      const extraQueryValue = extraKey ? req.query[extraKey] ?? req.params[extraKey] : undefined;
      const result = await getDataById({ model: Model, req, res, extraKey, extraQueryValue });
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // PATCH route - Update data by ID
  routes.route(`/${routeName}/:id`).patch(async (req, res) => {
    try {
      const extraKey = configs?.extraQueryField;
      const extraQueryValue = extraKey ? req.query[extraKey] ?? req.params[extraKey] : undefined;
      const result = await updateDataById({ model: Model, req, res, extraKey, extraQueryValue });
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // PATCH route - Update data by ID
  routes.route(`/${routeName}/:id`).patch(async (req, res) => {
    try {
      const extraKey = configs?.extraQueryField;
      const extraQueryValue = extraKey ? req.query[extraKey] ?? req.params[extraKey] : undefined;
      const result = await updateDataById({ model: Model, req, res, extraKey, extraQueryValue });
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // PATCH route - Archive/Unarchive data by ID
  routes.route(`/${routeName}/archive/:id`).patch(async (req, res) => {
    try {
      const extraKey = configs?.extraQueryField;
      const extraQueryValue = extraKey ? req.query[extraKey] ?? req.params[extraKey] : undefined;
      const result = await archiveDataById({ model: Model, req, res, extraKey, extraQueryValue });
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
};

export default crudRoutesWithControllers;
