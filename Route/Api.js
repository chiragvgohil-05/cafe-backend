import express from "express";
import MainRoutes from '../Controllers/Routes.js';
import cors from 'cors';

export default (app) => {
  app.use(cors());      
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use("/api", MainRoutes);
};
