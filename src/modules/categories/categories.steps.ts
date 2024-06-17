import { classes } from '@automapper/classes';
import {
    CamelCaseNamingConvention,
    SnakeCaseNamingConvention,
} from '@automapper/core';
import { AutomapperModule, getMapperToken } from '@automapper/nestjs';
import { Test, TestingModule } from '@nestjs/testing';
import { CategoriesRepository } from './categories.repository';
import { CategoriesService } from './categories.service';
import { defineFeature, loadFeature } from 'jest-cucumber';

const feature = loadFeature('features/Categoria.feature');

defineFeature(feature, test => {
    let categoriesService: CategoriesService
    let categoriesRepositoryMock: jest.Mocked<CategoriesRepository>

    beforeAll(async () => {
        const module: TestingModule = await Test.createTestingModule({
          providers: [
            CategoriesService,
            {
              provide: CategoriesRepository,
              useFactory: () => ({
                exists: jest.fn(),
                add: jest.fn(),
              }),
            }
          ],
          imports: [
            AutomapperModule.forRoot({
              strategyInitializer: classes(),
              namingConventions: {
                source: new CamelCaseNamingConvention(),
                destination: new SnakeCaseNamingConvention(),
              },
            }),
          ],
        }).compile();
    
        categoriesService = module.get<CategoriesService>(CategoriesService);
        categoriesRepositoryMock = module.get(CategoriesRepository);
    });
    

    test('Adicionar categoria', ({ given, when, then }) => {
        let result;
        let categoryService;
        let categoryName;
        let categoryImage;

        given(/^Não existe a categoria "([^"]*)" no repositório de categorias$/, async (name) => {
        categoriesRepositoryMock.exists.mockResolvedValue(Promise.resolve(false));
        categoryName = name;
        });

        when(/^Eu chamo o método "addCategory" do "CategoriesService" com o nome "([^"]*)" e imagem "([^"]*)"$/, async (name, image) => {
        categoryImage = image;
        categoryService = new CategoriesService(categoriesRepositoryMock);
        
        // Mock the add method to return a Promise that resolves to an object with an ID
        categoriesRepositoryMock.add.mockResolvedValue(Promise.resolve({ 
            id: 1, 
            name: categoryName, 
            deletedAt: null,
            createdAt: new Date(),
            updatedAt: new Date(),
            Media: {
                id: 1,
                url: categoryImage
            },
            mediaId: 1,
        }));

        result = await categoryService.addCategory({ name: categoryName, image: categoryImage });
        });

        then(/^Eu recebo o ID "([^"]*)"$/, async (id) => {
            expect(result.id).toBe(Number(id));
        });

        then(/^A categoria de ID "([^"]*)", nome "([^"]*)" e imagem "([^"]*)" está no repositório de categorias$/, async (id, name, image) => {
        expect(categoriesRepositoryMock.add).toHaveBeenCalledWith(
            expect.objectContaining({
                name: name,
                image: image
            }),
        );
        });
    });
});
