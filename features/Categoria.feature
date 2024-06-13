Feature: Categoria
    As a Administrador
    I want to Adicionar, editar e deletar categorias
    So that Eu posso mantar meus item organizados pelo seu tipo

Scenario: Adicionar categoria
Given Eu estou logado como "Administrador"
And Não há categorias no sistema
When Eu escolho "adicionar categoria"
And Preencho o nome com "Tênis" e a imagem com "Tenis.png"
Then Eu vejo uma mensagem "Categoria adicionada com sucesso"
And Eu vejo uma categoria com o nome "Tênis" e uma imagem "Tenis.png"

Scenario: Adicionar mais categoria
Given Eu estou logado como "Administrador"
And Existe uma categoria "Tênis" cadastrada
And Existe uma categoria "Bota" cadastrada
When Eu escolho "adicionar categoria"
And Preencho o nome com "Chuteira" e a imagem com "Chuteira.png"
Then Eu vejo uma mensagem "Categoria adicionada com sucesso"
And Eu vejo uma categoria com o nome "Tênis" e uma imagem "Tenis.png"
And Eu vejo uma categoria com o nome "Bota" e uma imagem "Bota.png"
And Eu vejo uma categoria com o nome "Chuteira" e uma imagem "Chuteira.png"

Scenario: Atualizar nome da categoria
Given Eu estou logado como "Administrador"
And Existe uma categoria "Tenis" cadastrada
And Existe uma categoria "Bota" cadastrada
And Existe uma categoria "Chuteira" cadastrada
When Eu escolho "atualizar categoria" na categoria "Tenis"
And Preencho o nome com "Tênis" e a imagem com "Tenis.png"
Then Eu vejo uma mensagem "Atualização concluída"
And Eu vejo uma categoria com o nome "Tênis" e uma imagem "Tenis.png"
And Eu vejo uma categoria com o nome "Bota" e uma imagem "Bota.png"
And Eu vejo uma categoria com o nome "Chuteira" e uma imagem "Chuteira.png"

Scenario: Atualizar imagem da categoria
Given Eu estou logado como "Administrador"
And Existe uma categoria "Tênis" cadastrada
And Existe uma categoria "Bota" cadastrada
And Existe uma categoria "Chuteira" cadastrada
When Eu escolho "atualizar categoria" na categoria "Tênis"
And Preencho o nome com "Tênis" e a imagem com "Tenis2.png"
Then Eu vejo uma mensagem "Atualização concluída"
And Eu vejo uma categoria com o nome "Tênis" e uma imagem "Tenis2.png"
And Eu vejo uma categoria com o nome "Bota" e uma imagem "Bota.png"
And Eu vejo uma categoria com o nome "Chuteira" e uma imagem "Chuteira.png"

Scenario: Deletar uma categoria
Given Eu estou logado como "Administrador"
And Existe uma categoria "Tênis" cadastrada
And Existe uma categoria "Bota" cadastrada
And Existe uma categoria "Chuteira" cadastrada
When Eu escolho "deletar categoria" na categoria "Tênis"
Then Eu vejo uma mensagem "Categoria deletada"
And Eu vejo uma categoria com o nome "Bota" e uma imagem "Bota.png"
And Eu vejo uma categoria com o nome "Chuteira" e uma imagem "Chuteira.png"