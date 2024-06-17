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
                create: jest.fn(),
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
        let categoryName;
        let categoryImageURL;

        given(/^Não existe a categoria "([^"]*)" no repositório de categorias$/, async (name) => {
        categoriesRepositoryMock.exists.mockResolvedValue(Promise.resolve(false));
        categoryName = name;
        });

        when(/^Eu chamo o método "createCategory" do "CategoriesService" com o nome "([^"]*)" e imagem "([^"]*)"$/, async (name, image) => {
        categoryImageURL = image;
        
        // Mock the add method to return a Promise that resolves to an object with an ID
        categoriesRepositoryMock.create.mockResolvedValue(Promise.resolve({ 
            id: 1, 
            name: categoryName, 
            deletedAt: null,
            createdAt: new Date(),
            updatedAt: new Date(),
            Media: {
                id: 1,
                url: categoryImageURL
            },
            mediaId: 1,
        }));

        result = await categoriesService.createCategory({ name: categoryName, imageUrl: categoryImageURL });
        });

        then(/^Eu recebo a categoria criada com o nome "([^"]*)", imagem "([^"]*)", e ID "([^"]*)"$/, async (id) => {
          expect(result).toEqual(
            expect.objectContaining({
              name: categoryName,
              Media: {
                url: categoryImageURL,
              },
            }),
          );
          expect(result.id).toBe(Number(id));
        });

        then(/^A categoria de ID "([^"]*)", nome "([^"]*)" e imagem "([^"]*)" está no repositório de categorias$/, async (id, name, image) => {
        expect(categoriesRepositoryMock.create).toHaveBeenCalledWith(
            expect.objectContaining({
                name: name,
                Media: {
                  create: {
                    url: categoryImageURL
                  }
                }
            }),
        );
        });
    });
});
