Features relacionadas ao funcionamento do carrinho na plataforma, e suas interações com produtos e criação de pedidos.

Scenario: Carrinho sem itens
	Given O usuário de CPF "12312312301" está na página "Carrinho"
	And Não há itens no carrinho
	When O usuário de CPF "12312312301" acessa a página "Carrinho"
	Then O usuário  de CPF "12312312301" é apresentado a mensagem "O carrinho ainda está vazio"
	And A opção de "realizar pedido" não é exibida na página

Scenario: Adicionar Produto ao Carrinho
	Given O usuário de CPF "12312312301" está na página "Produtos"
	And O produto “Tênis vermelho” é listado na página
	When O usuário de CPF "12312312301" adiciona o produto "Tênis vermelho" ao carrinho
	Then O usuário de CPF "12312312301" recebe uma sinalização visual com a mensagem "Produto adicionado ao carrinho"
	And O usuário de CPF "12312312301" visualiza o item "Tênis vermelho" na aba do carrinho

Scenario: Remover Produto do Carrinho
	Given O usuário de CPF "12312312301" está na página "Carrinho"
	And O produto “Tênis vermelho” está no carrinho do usuário
	When O usuário de CPF "12312312301" remove o produto "Tênis vermelho" do carrinho
	Then O carrinho do usuário de CPF "12312312301" não contém mais o item "Tênis vermelho"

//endline


