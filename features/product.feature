Feature: Criação e manutenção de itens no menu

Scenario: Adicionar item
    Given Não existe o produto "Tênis" no repositório de produtos
    When Eu chamo o método "createProduct" do "ProductsService" com o nome "Tênis" e preço "99.99"
    Then Eu recebo o produto criado com o nome "Tênis" e preço "99.99"
    And O produto de ID "1", nome "Tênis" e preço "99.99" está no repositório de produtos

Scenario: Adicionar item com o mesmo nome
    Given O produto de ID "1", nome "Tênis" e preço "99.99" existe no repositório de produtos
    When Eu chamo o método "createProduct" do "ProductsService" com o nome "Tênis" e preço "99.99"
    Then Eu recebo um erro

Scenario: Obter todos os itens
    Given Existem produtos no repositório de produtos
    When Eu chamo o método "getProducts" do "ProductsService"
    Then Eu recebo uma lista com todos produtos do repositório de produtos

Scenario: Atualizar item
    Given O produto de ID "1", nome "Tênis" e preço "99.99" existe no repositório de produtos
    When Eu chamo o método "updateProduct" do "ProductsService" com o ID "1", nome "Tênis" e preço "109.99"
    Then O produto de ID "1" agora possui nome "Tênis" e preço "109.99"

Scenario: Deletar item
    Given O produto de ID "1", nome "Tênis" e preço "99.99" existe no repositório de produtos
    When Eu chamo o método "deleteProduct" do "ProductsService" com o ID "1"
    Then O produto de ID "1" não existe no repositório de produtos

Scenario: Erro de Item Não Encontrado ao Deletar
    Given não existe um produto cadastrado de ID 01 e nome "Tenis branco"
    And o dado de deleção do produto contém o ID 01
    When o serviço de produtos tenta deletar o produto
    Then o repositório de produtos deve ser chamado para encontrar o produto
    And a resposta deve conter a mensagem "ITEM_NOT_FOUND"
    And nenhum item é removido

