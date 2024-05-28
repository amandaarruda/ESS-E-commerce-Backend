Notificação de Confirmação de Pedido

User Story: Como usuário do sistema, eu quero receber uma notificação para saber se o pedido solicitado foi confirmado

Cenário: Enviar notificação de confirmação de pedido por email
Given o usuário está logado no sistema
And o usuário está na página “Finalização de pedido”
And o cliente completou o pagamento do pedido
And o cliente forneceu um endereço de email válido cliente@gmail.com
When o pedido é confirmado pelo sistema
Then o sistema deve enviar um email de confirmação para cliente@gmail.com
And o email deve conter o número do pedido e os detalhes do mesmo

Cenário: Enviar notificação quando o pedido não pode ser confirmado
Given o usuário cliente está logado no sistema
And o usuário cliente está na página “Finalização de pedido”
And o usuário cliente não completou algum dos seguintes dados de pagamento: “Número do cartão”, “Data de validade”, “Código de segurança (CVV)”, “Nome do titular do cartão”
When o sistema tenta confirmar o pedido sem ter fornecido todos os dados do pagamento
Then o sistema deve exibir uma mensagem na tela informando que O pedido não pode ser confirmado sem os dados completos de pagamento.
