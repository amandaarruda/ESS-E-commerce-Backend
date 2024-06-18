Feature: Carrinho de Compras

  Background:
    Given o usuário com CPF "12312312301" está logado

  Scenario: Carrinho sem itens
    Given o carrinho do usuário de CPF "12312312301" está vazio
    When o usuário de CPF "12312312301" acessa a página "Carrinho"
    Then o usuário de CPF "12312312301" vê a mensagem "O carrinho ainda está vazio"
    And a opção de "realizar pedido" não é exibida na página

  Scenario: Adicionar Produto ao Carrinho
    Given o produto “Tênis vermelho” está disponível na página "Produtos"
    When o usuário de CPF "12312312301" adiciona o produto "Tênis vermelho" ao carrinho
    Then o servidor retorna uma confirmação de que o produto foi adicionado ao carrinho
    And o carrinho do usuário de CPF "12312312301" contém o item "Tênis vermelho"

  Scenario: Remover Produto do Carrinho
    Given o produto “Tênis vermelho” está no carrinho do usuário de CPF "12312312301"
    When o usuário de CPF "12312312301" remove o produto "Tênis vermelho" do carrinho
    Then o servidor confirma que o item "Tênis vermelho" foi removido do carrinho
    And o carrinho do usuário de CPF "12312312301" não contém mais o item "Tênis vermelho"

  Scenario: Carrinho de compras mantém os itens
    Given os produtos "Sapato social" e "Tênis azul" estão no carrinho do usuário de CPF "12312312301"
    When o usuário de CPF "12312312301" sai da aplicação
    And o usuário de CPF "12312312301" faz login novamente e acessa a página "Carrinho"
    Then o carrinho do usuário de CPF "12312312301" ainda contém os itens "Sapato social" e "Tênis azul"
    And a opção de "realizar pedido" está disponível

  Scenario: Realização de Pedido
    Given os produtos "Sapato social" e "Tênis azul" estão no carrinho do usuário de CPF "12312312301"
    When o usuário de CPF "12312312301" escolhe "realizar pedido"
    Then o servidor redireciona o usuário para a página "finalização de pedido"
    When o usuário de CPF "12312312301" informa suas informações de "endereço"
    And o usuário de CPF "12312312301" segue para "finalizar pedido"
    Then o servidor confirma a finalização do pedido com a mensagem "Sucesso! O seu pedido foi finalizado."

  Scenario: Realização de Pedido sem informar endereço
    Given os produtos "Sapato social" e "Tênis azul" estão no carrinho do usuário de CPF "12312312301"
    When o usuário de CPF "12312312301" escolhe "realizar pedido"
    Then o servidor redireciona o usuário para a página "finalização de pedido"
    And o usuário de CPF "12312312301" tenta finalizar o pedido sem informar o endereço
    Then o servidor retorna uma mensagem de erro "Ocorreu um erro."
