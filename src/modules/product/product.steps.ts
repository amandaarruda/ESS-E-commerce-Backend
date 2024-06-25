import { classes } from '@automapper/classes';
import {
  CamelCaseNamingConvention,
  SnakeCaseNamingConvention,
} from '@automapper/core';
import { AutomapperModule, getMapperToken } from '@automapper/nestjs';
import { ConflictException } from '@nestjs/common';
import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { defineFeature, loadFeature } from 'jest-cucumber';
import { ProductRepository } from 'src/modules/product/product.repository';
import { ProductService } from 'src/modules/product/product.service';

import { ProductMediaEntity } from './entity/media.entity';
import { ProductEntity } from './entity/product.entity';

const feature = loadFeature('features/product.feature');

defineFeature(feature, test => {
  let productService: ProductService;
  let productRepositoryMock: jest.Mocked<ProductRepository>;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductService,
        {
          provide: ProductRepository,
          useFactory: () => ({
            exists: jest.fn(),
            create: jest.fn(),
            getById: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
          }),
        },
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

    productService = module.get<ProductService>(ProductService);
    productRepositoryMock = module.get(ProductRepository);
  });

  /*test('Inclusão de item ao banco de dados com todos os campos obrigatórios', ({
    given,
    when,
    then,
  }) => {
    let result: ProductEntity;
    let productName: string;
    let productPrice: string;
    let productStock: string;
    let productCategory: string;
    let productDescription: string;
    let productImageUrl: string;

    given(
      /^que não existe um produto previamente cadastrado com nome de "([^"]*)"$/,
      async name => {
        productRepositoryMock.exists.mockResolvedValue(Promise.resolve(false));
        productName = name;
      },
    );

    given(
      /^o dado de criação do produto contém o nome "([^"]*)", o preço "([^"]*)", a quantidade de estoque "([^"]*)", o id da categoria "([^"]*)", a descrição "([^"]*)" e a url da imagem "([^"]*)"$/,
      (name, price, stock, categoryId, description, ProductMediaEntity) => {
        productName = name;
        productPrice = price;
        productStock = stock;
        productCategory = categoryId;
        productDescription = description;
        productImageUrl = ProductMediaEntity;
      },
    );

    when(/^o serviço de criação de produtos registra o produto$/, async () => {
      const mockReturn: ProductEntity = {
        id: 1,
        name: productName,
        price: parseFloat(productPrice),
        stock: parseInt(productStock, 10),
        categoryId: parseInt(productCategory, 10),
        description: productDescription,
        category: {
          id: 1,
          name: 'Shoes',
          Media: { id: 1, url: 'https://example.com/media/image.jpg' },
          deletedAt: undefined,
          createdAt: undefined,
          updatedAt: undefined,
          mediaId: 0,
        },
        productMedia: [
          {
            id: 1,
            productId: 1,
            mediaId: 1,
            media: {
              id: 1,
              url: productImageUrl,
            },
          },
        ],
        createdAt: new Date(),
        deletedAt: null,
        updatedAt: null,
      };
      productRepositoryMock.create.mockResolvedValue(
        Promise.resolve(mockReturn),
      );

      result = await productService.createItem({
        name: productName,
        price: parseFloat(productPrice),
        stock: parseInt(productStock, 10),
        categoryId: parseInt(productCategory, 10),
        description: productDescription,
        imageUrl: productImageUrl,
      });
    });

    then(
      /^o produto "([^"]*)" deve ser cadastrado com os dados registrados$/,
      async name => {
        expect(result).toEqual(
          expect.objectContaining({
            name: productName,
            price: parseFloat(productPrice),
            stock: parseInt(productStock, 10),
            categoryId: parseInt(productCategory, 10),
            description: productDescription,
            ProductMediaEntity: productImageUrl,
          }),
        );
      },
    );

    then(
      /^o repositório de produtos deve verificar a existência de um produto com o nome "([^"]*)"$/,
      async name => {
        expect(productRepositoryMock.exists).toHaveBeenCalledWith(name);
      },
    );

    then(
      /^a resposta deve conter a mensagem "Item successfully created"$/,
      () => {
        expect(result).toBeDefined();
      },
    );
  });*/

  /*test('Atualização de item previamente existente do banco de dados', ({
    given,
    when,
    then,
  }) => {
    let result: ProductEntity;
    let productId: number;
    let newProductName: string;

    given(
      /^existe um produto cadastrado com ID (\d+) e nome "([^"]*)"$/,
      async (id, name) => {
        productId = parseInt(id, 10);
        productRepositoryMock.getById.mockResolvedValue(
          Promise.resolve({
            id: productId,
            name: name,
            price: 100.0,
            stock: 50,
            categoryId: 1,
            description: 'Tênis monocromático branco',
            //productMedia: 'www.google.com/tenis.jpg',
            createdAt: new Date(),
            updatedAt: new Date(),
            deletedAt: null,
            category: {
              id: 1,
              name: 'Shoes',
              Media: { id: 1, url: 'https://example.com/media/image.jpg' },
              deletedAt: undefined,
              createdAt: undefined,
              updatedAt: undefined,
              mediaId: 0,
            },
            productMedia: [
              {
                id: 1,
                productId: 1,
                mediaId: 1,
                media: {
                  id: 1,
                  url: 'https://example.com/media/image.jpg',
                },
              },
            ],
          }),
        );
      },
    );

    given(
      /^o usuário administrador que atualizar o produto com ID (\d+), definindo seu nome para "([^"]*)"$/,
      (id, name) => {
        productId = parseInt(id, 10);
        newProductName = name;
      },
    );

    given(/^o dado de atualização dos produtos contém "([^"]*)"$/, name => {
      newProductName = name;
    });

    when(/^o serviço de produtos atualiza os dados do produto$/, async () => {
      productRepositoryMock.update.mockResolvedValue(
        Promise.resolve({
          id: productId,
          name: newProductName,
          price: 100.0,
          stock: 50,
          categoryId: 1,
          description: 'Tênis monocromático branco',
          imageUrl: 'www.google.com/tenis.jpg',
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
          category: {
            id: 1,
            name: 'Shoes',
            Media: { id: 1, url: 'https://example.com/media/image.jpg' },
            deletedAt: undefined,
            createdAt: undefined,
            updatedAt: undefined,
            mediaId: 0,
          },
          productMedia: [
            {
              id: 1,
              productId: 1,
              mediaId: 1,
              media: {
                id: 1,
                url: 'https://example.com/media/image.jpg',
              },
            },
          ],
        }),
      );

      result = await productService.updateItem(productId, {
        name: newProductName,
      });
    });

    then(
      /^o repositório de produtos deve encontrar o produto pelo ID (\d+)$/,
      async id => {
        expect(productRepositoryMock.getById).toHaveBeenCalledWith(
          parseInt(id, 10),
        );
      },
    );

    then(
      /^o repositório de produtos deve atualizar o nome do produto de ID (\d+) para "([^"]*)"$/,
      async (id, name) => {
        expect(productRepositoryMock.update).toHaveBeenCalledWith(
          parseInt(id, 10),
          expect.objectContaining({ name }),
        );
      },
    );

    then(
      /^a resposta deve conter a mensagem "Item successfully updated"$/,
      () => {
        expect(result).toBeDefined();
      },
    );
  });*/

  /* test('Remoção de item previamente existente do banco de dados', ({
    given,
    when,
    then,
  }) => {
    let result: boolean;
    let productId: number;

    given(/^existe um item de ID (\d+)$/, id => {
      productId = parseInt(id, 10);
      productRepositoryMock.getById.mockResolvedValue(
        Promise.resolve({
          id: productId,
          name: 'Tenis branco',
          price: 100.0,
          stock: 50,
          categoryId: 1,
          description: 'Tênis monocromático branco',
          imageUrl: 'www.google.com/tenis.jpg',
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
          category: {
            id: 1,
            name: 'Shoes',
            Media: { id: 1, url: 'https://example.com/media/image.jpg' },
            deletedAt: undefined,
            createdAt: undefined,
            updatedAt: undefined,
            mediaId: 0,
          },
          productMedia: [
            {
              id: 1,
              url: 'https://example.com/media/image.jpg',
              media: { id: 1, url: 'https://example.com/media/image.jpg' },
              mediaId: 1,
              productId: 1,
            },
          ],
        }),
      );

      given(
        /^um usuário administrador tenta remover o item com ID (\d+)$/,
        id => {
          productId = parseInt(id, 10);
        },
      );

      when(/^o serviço de produtos deleta o produto de ID (\d+)$/, async id => {
        //productRepositoryMock.delete.mockResolvedValue({ affected: 1 });
        productRepositoryMock.delete.mockResolvedValueOnce();
        result = await productService.deleteItem(parseInt(id, 10));
      });

      then(
        /^o repositório de produtos deve encontrar o produto pelo ID (\d+)$/,
        async id => {
          expect(productRepositoryMock.getById).toHaveBeenCalledWith(
            parseInt(id, 10),
          );
        },
      );

      then(
        /^o repositório de produtos deve deletar o produto de ID (\d+)$/,
        async id => {
          expect(productRepositoryMock.delete).toHaveBeenCalledWith(
            parseInt(id, 10),
          );
        },
      );

      then(
        /^a resposta deve conter a mensagem "Item successfully deleted"$/,
        () => {
          expect(result).toBeTruthy();
        },
      );
    });
  });
  
  /*test('Erro de Validação de Campos Obrigatórios ao Adicionar Item', ({
    given,
    when,
    then,
  }) => {
    let result: Promise<ProductEntity>;

    given(
      /^o serviço de inclusão de itens requer os campos nome, preço, quantidade de estoque, ID da categoria, descrição e url da imagem$/,
      () => {
        //Regra definida no serviço
      },
    );

    given(
      /^o dado de criação do produto contém o nome "([^"]*)", a quantidade de estoque "([^"]*)", a descrição "([^"]*)" e a url da imagem "([^"]*)"$/,
      (name, stock, description, imageUrl) => {
        //Não contém preço e ID da categoria
      },
    );

    when(
      /^o serviço de criação de produtos tenta registrar o produto$/,
      async () => {
        result = productService.createItem({
          name: 'Tenis branco',
          price: undefined,
          stock: 50,
          categoryId: undefined,
          description: 'Tênis monocromático branco',
          imageUrl: 'www.google.com/tenis.jpg',
        });
      },
    );

    then(/^nenhum item é adicionado$/, async () => {
      await expect(result).rejects.toThrow(
        'Validation error: Campos obrigatórios não fornecidos',
      );
    });

    then(
      /^a resposta deve conter a mensagem "Validation error: Campos obrigatórios não fornecidos"$/,
      async () => {
        await expect(result).rejects.toThrow(
          'Validation error: Campos obrigatórios não fornecidos',
        );
      },
    );
  });*/

  /*test('Erro de Item Já Existente ao Adicionar', ({ given, when, then }) => {
    let result: Promise<ProductEntity>;

    given(
      /^existe um item de nome "([^"]*)" previamente cadastrado$/,
      async name => {
        productRepositoryMock.exists.mockResolvedValue(Promise.resolve(true));
      },
    );

    given(
      /^o dado de criação do produto contém o nome "([^"]*)", o preço "([^"]*)", a quantidade de estoque "([^"]*)", o id da categoria "([^"]*)", a descrição "([^"]*)" e a url da imagem "([^"]*)"$/,
      (name, price, stock, category, description, imageUrl) => {
        //Dados do produto
      },
    );

    when(
      /^o serviço de criação de produtos tenta registrar o produto$/,
      async () => {
        result = productService.createItem({
          name: 'Tenis branco',
          price: 100.0,
          stock: 50,
          categoryId: 1,
          description: 'Tênis monocromático branco',
          imageUrl: 'www.google.com/tenis.jpg',
        });
      },
    );

    then(
      /^a resposta deve conter a mensagem "Item already exists"$/,
      async () => {
        await expect(result).rejects.toThrow('Item already exists');
      },
    );

    then(/^nenhum novo item será criado$/, async () => {
      await expect(result).rejects.toThrow('Item already exists');
    });
  });*/

  test('Erro de Item Já Existente ao Adicionar', ({ given, when, then }) => {
    let result: Promise<ProductEntity>;

    given(
      /^existe um item de nome "([^"]*)" previamente cadastrado$/,
      async name => {
        productRepositoryMock.exists.mockResolvedValue(true);
      },
    );

    when(
      /^o serviço de criação de produtos tenta registrar o produto$/,
      async () => {
        result = productService.createItem({
          name: 'Tenis branco',
          price: 100.0,
          stock: 50,
          categoryId: 1,
          description: 'Tênis monocromático branco',
          imageUrl: 'www.google.com/tenis.jpg',
        });
      },
    );

    then(
      /^a resposta deve conter a mensagem "Item already exists"$/,
      async () => {
        await expect(result).rejects.toThrow(BadRequestException);
      },
    );

    then(/^nenhum novo item será criado$/, async () => {
      try {
        await productService.createItem({
          name: 'Tenis branco',
          price: 100.0,
          stock: 50,
          categoryId: 1,
          description: 'Tênis monocromático branco',
          imageUrl: 'www.google.com/tenis.jpg',
        });
        throw new Error('Expected error to be thrown');
      } catch (error) {
        expect(error.message).toContain('Item already exists');
      }
    });
  });

  /*test('Erro de Validação de Tipo de Dado ao Atualizar', ({
    given,
    when,
    then,
  }) => {
    let result: Promise<ProductEntity>;

    given(
      /^existe um produto cadastrado com ID (\d+) e nome "([^"]*)"$/,
      async (id, name) => {
        productRepositoryMock.getById.mockResolvedValue(
          Promise.resolve({
            id: parseInt(id, 10),
            name: name,
            price: 100.0,
            stock: 50,
            categoryId: 1,
            description: 'Tênis monocromático branco',
            imageUrl: 'www.google.com/tenis.jpg',
            createdAt: new Date(),
            updatedAt: new Date(),
            deletedAt: null,
            category: {
              id: 1,
              name: 'Shoes',
              Media: { id: 1, url: 'https://example.com/media/image.jpg' },
              deletedAt: undefined,
              createdAt: undefined,
              updatedAt: undefined,
              mediaId: 0,
            },
            productMedia: [
              {
                id: 1,
                productId: 1,
                mediaId: 1,
                media: {
                  id: 1,
                  url: 'https://example.com/media/image.jpg',
                },
              },
            ],
          }),
        );
      },
    );

    given(
      /^o usuário administrador que atualizar o produto com ID (\d+), definindo seu preço para "([^"]*)"$/,
      (id, price) => {
        // Price provided as -45.00
      },
    );

    given(/^o dado de atualização dos produtos contém "([^"]*)"$/, price => {
      // Price provided as -45.00
    });

    when(
      /^o serviço de produtos tenta atualizar os dados do produto$/,
      async () => {
        result = productService.updateItem(1, { price: -45.0 });
      },
    );

    then(
      /^a resposta deve conter a mensagem "BadRequestException: Preço deve ser maior que 0"$/,
      async () => {
        await expect(result).rejects.toThrow(
          'BadRequestException: Preço deve ser maior que 0',
        );
      },
    );

    then(/^o item não é atualizado$/, async () => {
      await expect(result).rejects.toThrow(
        'BadRequestException: Preço deve ser maior que 0',
      );
    });
  });*/

  /*test('Erro de Item Não Encontrado ao Atualizar', ({ given, when, then }) => {
    let result: Promise<ProductEntity>;

    given(
      /^não existe um produto previamente cadastrado com ID (\d+)$/,
      async id => {
        productRepositoryMock.getById.mockResolvedValue(Promise.resolve(null));
      },
    );

    given(
      /^o usuário administrador que atualizar o produto com ID (\d+), definindo seu preço para "([^"]*)"$/,
      (id, price) => {
        // Price provided as 45.00
      },
    );

    given(/^o dado de atualização dos produtos contém "([^"]*)"$/, price => {
      // Price provided as 45.00
    });

    when(
      /^o serviço de produtos tenta atualizar o preço do produto de ID (\d+)$/,
      async id => {
        result = productService.updateItem(parseInt(id, 10), {
          price: 45,
        });
      },
    );

    then(/^a resposta deve conter a mensagem "ITEM_NOT_FOUND"$/, async () => {
      await expect(result).rejects.toThrow('ITEM_NOT_FOUND');
    });

    then(/^o item não é atualizado$/, async () => {
      await expect(result).rejects.toThrow('ITEM_NOT_FOUND');
    });
  });*/

  /*test('Erro de Item Não Encontrado ao Atualizar', ({
    given,
    when,
    then,
    and,
  }) => {
    let result: Promise<ProductEntity>;

    given(
      /^não existe um produto previamente cadastrado com ID (\d+)$/,
      async id => {
        productRepositoryMock.getById.mockResolvedValue(Promise.resolve(null));
      },
    );

    and(/^o dado de atualização dos produtos contém "(.*)"$/, price => {
      // Simula o dado de atualização do preço
    });

    when(
      /^o serviço de produtos tenta atualizar o preço do produto de ID (\d+)$/,
      async id => {
        result = productService.updateItem(parseInt(id, 10), {
          price: 45,
        });
      },
    );

    then(/^a resposta deve conter a mensagem "ITEM_NOT_FOUND"$/, async () => {
      await expect(result).rejects.toThrow('ITEM_NOT_FOUND');
    });

    then(/^o item não é atualizado$/, async () => {
      await expect(result).rejects.toThrow('ITEM_NOT_FOUND');
    });
  });*/

  test('Erro de ID Faltando ao Deletar Item', ({ given, when, then }) => {
    let result: Promise<boolean>;

    given(
      /^existe um produto cadastrado de ID (\d+) e nome "([^"]*)"$/,
      async (id, name) => {
        productRepositoryMock.getById.mockResolvedValue(
          Promise.resolve({
            id: parseInt(id, 10),
            name: name,
            price: 100.0,
            stock: 50,
            categoryId: 1,
            description: 'Tênis monocromático branco',
            imageUrl: 'www.google.com/tenis.jpg',
            createdAt: new Date(),
            updatedAt: new Date(),
            deletedAt: null,
            category: {
              id: 1,
              name: 'Shoes',
              Media: { id: 1, url: 'https://example.com/media/image.jpg' },
              deletedAt: undefined,
              createdAt: undefined,
              updatedAt: undefined,
              mediaId: 0,
            },
            productMedia: [
              {
                id: 1,
                productId: 1,
                mediaId: 1,
                media: {
                  id: 1,
                  url: 'https://example.com/media/image.jpg',
                },
              },
            ],
          }),
        );
      },
    );

    given(/^o dado de deleção do produto está vazio$/, () => {
      // No data provided
    });

    when(/^o serviço de produtos tenta deletar o produto$/, async () => {
      result = productService.deleteItem(undefined);
    });

    then(
      /^o repositório de produtos não deve ser chamado para encontrar o produto$/,
      async () => {
        expect(productRepositoryMock.getById).not.toHaveBeenCalled();
      },
    );

    then(
      /^o repositório de produtos não deve ser chamado para deletar o produto$/,
      async () => {
        expect(productRepositoryMock.delete).not.toHaveBeenCalled();
      },
    );

    then(
      /^a resposta deve conter a mensagem "Validation error: ID do item não fornecido"$/,
      async () => {
        await expect(result).rejects.toThrow(
          'Validation error: ID do item não fornecido',
        );
      },
    );

    then(/^nenhum item é removido$/, async () => {
      await expect(result).rejects.toThrow(
        'Validation error: ID do item não fornecido',
      );
    });
  });

  test('Erro de Item Não Encontrado ao Deletar', ({ given, when, then }) => {
    let result: Promise<boolean>;
    let productId;

    given(
      /^não existe um produto cadastrado de ID (\d+) e nome "([^"]*)"$/,
      async (id, name) => {
        console.log(`Mocking getById for ID ${id}`);
        productRepositoryMock.getById.mockResolvedValue(null);
      },
    );
    given(/^o dado de deleção do produto contém o ID (\d+)$/, id => {
      productId = parseInt(id);
      console.log(`Product ID set to ${productId}`);
    });

    when(/^o serviço de produtos tenta deletar o produto$/, async () => {
      result = productService.deleteItem(productId);
    });

    then(
      /^o repositório de produtos deve ser chamado para encontrar o produto$/,
      async () => {
        expect(productRepositoryMock.getById).toHaveBeenCalledWith(productId);
      },
    );

    then(/^a resposta deve conter a mensagem "ITEM_NOT_FOUND"$/, async () => {
      await expect(result).rejects.toThrow('ITEM_NOT_FOUND');
    });

    then(/^nenhum item é removido$/, async () => {
      await expect(result).rejects.toThrow('ITEM_NOT_FOUND');
    });
  });
});
