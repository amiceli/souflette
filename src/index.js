import { Application } from 'stimulus'
import ImageSorterController from './controllers/imageSorterController.js'

const Stimulus = Application.start()

Stimulus.register('image-sorter', ImageSorterController)
