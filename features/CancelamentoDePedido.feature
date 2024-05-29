Feature: Cancelamento de pedidos

    Como um cliente,
    Eu quero ver o histórico dos meus pedidos e cancelar pedidos não entregues, para que eu possa receber somente os pedidos que ainda desejo.

Scenario: Cancelar pedido não entregue
    Given que o usuário (cliente) está na página “histórico de pedidos” do usuário “Maria Julia” com CPF “123.456.789-10”
    And o pedido “Scarpin” com o ID “1001” está com o status “à caminho” 
    When usuário seleciona o botão “cancelar pedido”
    Then pop-up de confirmação de cancelamento aparece para o usuário
    And pedido cancelado “Scarpin” com o ID “1001” passa a ter com o status “cancelado” 
    And aparece a mensagem “Pedido foi cancelado com sucesso”

Scenario: Cancelar pedido entregue 
    Given que o usuário (cliente) está na página de histórico de pedidos do usuário “Maria Julia - nome usuário” com CPF “123.456.789-10”
    And o pedido “Mocassin” com o ID “1101” está com o status “entregue” 
    When usuário seleciona o botão “cancelar pedido”
    Then pop-up com mensagem de aviso “cancelamento não permitido, produto já entregue!" 

Scenario: Cancelar pedido não entregue 1
    Given que o usuário (cliente) está na página “histórico de pedidos” do usuário “Carla Pinheiro” com CPF “123.456.789-11”
    And o pedido “Nike Inspiration” com o ID “102” está com o status “em preparação” 
    When usuário seleciona o botão “cancelar pedido”
    Then pop-up de confirmação de cancelamento aparece para o usuário
    And pedido cancelado “Nike Inspiration” com o ID “102”  passa a ter com o status “cancelado
    And aparece a mensagem “Pedido foi cancelado com sucesso”

Scenario: Cancelar pedido não entregue 2
    Given que o usuário (cliente) está na página de histórico de pedidos do usuário “Lucia Regina” com CPF “123.456.789-12”
    And o pedido “Adidas Adventure” com o ID “103” está com o status “chega hoje” 
    When usuário seleciona o botão “cancelar pedido”
    Then pop-up de confirmação de cancelamento aparece para o usuário
    And pedido cancelado “Adidas Adventure” com o ID “103” passa a ter com o status “cancelado
    And aparece a mensagem “Pedido foi cancelado com sucesso”
