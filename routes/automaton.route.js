import { Router } from 'express';
import automatonController from '../controllers/automaton.controller';

var api = Router()
api.post('/operateRegex', automatonController.operateRegex);