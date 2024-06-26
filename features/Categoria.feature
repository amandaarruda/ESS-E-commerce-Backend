Feature: Categorias

    Scenario: Adicionar categoria
        Given Não existe a categoria "Tenis" no repositório de categorias
        When Eu chamo o método "createCategory" do "CategoriesService" com o nome "Tenis" e imagem "https://cdn-icons-png.flaticon.com/512/2589/2589903.png"
        Then Eu recebo a categoria criada com o nome "Tenis", imagem "https://cdn-icons-png.flaticon.com/512/2589/2589903.png", e ID "1"
        And A categoria de ID "1", nome "Tenis" e imagem "https://cdn-icons-png.flaticon.com/512/2589/2589903.png" está no repositório de categorias
    
    Scenario: Adicionar categoria com o mesmo nome
        Given A categoria de ID "1", nome "Tenis" e imagem "https://cdn-icons-png.flaticon.com/512/2589/2589903.png" existe no repositório de categorias
        When Eu chamo o método "createCategory" do "CategoriesService" com o nome "Tenis" e imagem "https://cdn-icons-png.flaticon.com/512/2589/2589903.png"
        Then Eu recebo um erro

     Scenario: Obter categoria por ID
        Given A categoria de ID "1", nome "Tenis" e imagem "https://cdn-icons-png.flaticon.com/512/2589/2589903.png" existe no repositório de categorias
        When Eu chamo o metodo "getCategoryById" do "CategoriesService" com o ID "1"
        Then Eu recebo a categoria de ID "1", nome "Tenis" e imagem "https://cdn-icons-png.flaticon.com/512/2589/2589903.png"