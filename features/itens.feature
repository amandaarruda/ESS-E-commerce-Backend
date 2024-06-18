Feature: Criação e manutenção de itens no menu

    Scenario: Inclusão de item ao banco de dados com todos os campos obrigatórios 
        Given um usuário administrador quer adicionar um item
        And o banco de dados requisita os campos nome, descrição, preço e imagem
        And não existe um item com nome “itemX” previamente cadastrado no banco de dados 
        When um usuário administrador com perfil "ADMIN" envia uma requisição POST para a rota /itens com nome "itemX", descrição "abcdef" e imagem "www.abcde.com"
        And o banco de dados requisita os campos nome, descrição, preço e imagem como obrigatórios
        Then o Status da resposta deve ser 201 
        And a resposta deve conter o detalhe "Item successfully created"

    Scenario: Atualização de item previamente existente do banco de dados 
        Given um usuário administrador quer editar um item 
        And o banco de dados possui os campos nome, descrição, preço e imagem como opcionais para a requisição PATCH
        When um usuário administrador com perfil "ADMIN" envia uma requisição PATCH para a rota /itens/1001 com preço “4.00”
        And o item com id 1001 está previamente cadastrado no banco de dados 
        Then o Status da resposta deve ser 200 
        And o preço do item com id 1001 é atualizado para "4.00" 
        And a resposta deve conter a mensagem "Item successfully updated"

    Scenario: Remoção de item previamente existente do banco de dados 
        Given o banco de dados requisita o id como obrigatório para deleção 
        When um usuário administrador com perfil "ADMIN" envia uma requisição DELETE para a rota /itens com id "1002" 
        And o item com id “1002” está previamente cadastrado no banco de dados 
        Then o Status da resposta deve ser 200 
        And a resposta deve conter a mensagem "Item successfully deleted"

    Scenario: Erro de Validação de Campos Obrigatórios ao Adicionar Item
        Given um usuário administrador quer adicionar um item
        And o banco de dados requisita os campos nome, descrição, preço e imagem
        When um usuário administrador com perfil "ADMIN" envia uma requisição POST para a rota /itens sem fornecer todos os campos obrigatórios
        Then o Status da resposta deve ser 400 (Bad Request)
        And a resposta deve conter o detalhe "Validation error: Campos obrigatórios não fornecidos"
       
    Scenario: Erro de Item Já Existente ao Adicionar
        Given um usuário administrador quer adicionar um item
        And o banco de dados requisita os campos nome, descrição, preço e imagem
        And já existe um item com nome "itemX" previamente cadastrado no banco de dados
        When um usuário administrador com perfil "ADMIN" envia uma requisição POST para a rota /itens com nome "itemX", descrição "abcdef" e imagem "www.abcde.com"
        Then o Status da resposta deve ser 409 (Conflict)
        And a resposta deve conter a mensagem "Item already exists"
    
    Scenario: Erro de Validação de Tipo de Dado ao Atualizar
        Given um usuário administrador quer editar um item
        And o banco de dados possui os campos nome, descrição, preço e imagem como opcionais para a requisição PATCH
        When um usuário administrador com perfil "ADMIN" envia uma requisição PATCH para a rota /itens/1001 com um valor inválido para o campo preço (por exemplo, "R$4,00" ao invés de "4.00")
        Then o Status da resposta deve ser 400 (Bad Request)
        And a resposta deve conter o detalhe "Validation error: Tipo de dado inválido para o campo preço"
    
    Scenario: Erro de Item Não Encontrado ao Atualizar
        Given um usuário administrador quer editar um item
        And o banco de dados possui os campos nome, descrição, preço e imagem como opcionais para a requisição PATCH
        When um usuário administrador com perfil "ADMIN" envia uma requisição PATCH para a rota /itens/9999 (ID inválido) com preço "4.00"
        Then o Status da resposta deve ser 404 (Not Found)
        And a resposta deve conter a mensagem "Item not found"
    
    Scenario: Erro de ID Faltando ao Deletar Item
        Given o banco de dados requisita o id como obrigatório para deleção
        When um usuário administrador com perfil "ADMIN" envia uma requisição DELETE para a rota /itens sem fornecer o ID do item a ser deletado
        Then o Status da resposta deve ser 400 (Bad Request)
        And a resposta deve conter o detalhe "Validation error: ID do item não fornecido"
    
    Scenario: Erro de Item Não Encontrado ao Deletar
        Given o banco de dados requisita o id como obrigatório para deleção
        When um usuário administrador com perfil "ADMIN" envia uma requisição DELETE para a rota /itens com id "9999" (ID inválido)
        Then o Status da resposta deve ser 404 (Not Found)
        And a resposta deve conter a mensagem "Item not found"
    
    Scenario: Erro de Atualização de Item Inexistente no Banco de Dados
        Given um usuário administrador quer editar um item
        And o banco de dados possui os campos nome, descrição, preço e imagem como opcionais para a requisição PATCH
        When um usuário administrador com perfil "ADMIN" envia uma requisição PATCH para a rota /itens/2001 com preço "5.00"
        And o item com id 2001 não está previamente cadastrado no banco de dados
        Then o Status da resposta deve ser 404 (Not Found)
        And a resposta deve conter a mensagem "Item not found"