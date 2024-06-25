Feature: Criação e manutenção de itens no menu

    Scenario: Erro de Validação de Tipo de Dado ao Atualizar
	    Given existe um produto cadastrado com ID 01 e nome "Tenis branco"
        And o usuário administrador que atualizar o produto com ID 01, definindo seu preço para "-45.00"
        And o dado de atualização dos produtos contém "-45.00"
        When o serviço de produtos tenta atualizar os dados do produto
        Then a resposta deve conter a mensagem "BadRequestException: Preço deve ser maior que 0"
        And o item não é atualizado       
    Scenario: Erro de Item Já Existente ao Adicionar
        Given existe um item de nome "Tenis branco" previamente cadastrado
        When o serviço de criação de produtos tenta registrar o produto
        Then a resposta deve conter a mensagem "Item already exists"
        And nenhum novo item será criado
    Scenario: Erro de ID Faltando ao Deletar Item
        Given existe um produto cadastrado de ID 01 e nome "Tenis branco"
        And o dado de deleção do produto está vazio
        When o serviço de produtos tenta deletar o produto
        Then o repositório de produtos não deve ser chamado para encontrar o produto
        And o repositório de produtos não deve ser chamado para deletar o produto
        And a resposta deve conter a mensagem "Validation error: ID do item não fornecido"
        And nenhum item é removido
    
    Scenario: Erro de Item Não Encontrado ao Deletar
        Given não existe um produto cadastrado de ID 01 e nome "Tenis branco"
        And o dado de deleção do produto contém o ID 01
        When o serviço de produtos tenta deletar o produto
        Then o repositório de produtos deve ser chamado para encontrar o produto
        And a resposta deve conter a mensagem "ITEM_NOT_FOUND"
        And nenhum item é removido
