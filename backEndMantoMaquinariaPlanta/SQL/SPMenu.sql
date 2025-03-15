-- =============================================
-- Crear un nuevo menú
-- =============================================
CREATE PROCEDURE sp_CrearMenu
    @Nombre NVARCHAR(100),
    @RutaHTML NVARCHAR(MAX)
AS
BEGIN
    SET NOCOUNT ON;
    
    INSERT INTO Menu (Nombre, RutaHTML, Estado)
    VALUES (@Nombre, @RutaHTML, 1);

    SELECT CAST(SCOPE_IDENTITY() AS INT) AS NuevoIdMenu; -- Retorna el ID del nuevo registro
END;

-- =============================================
-- Obtener todos los menús activos
-- =============================================
CREATE PROCEDURE sp_ObtenerMenus
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT IdMenu, Nombre, RutaHTML, Estado
    FROM Menu
    WHERE Estado = 1; -- Solo menús activos
END;

-- =============================================
-- Obtener un menú por ID
-- =============================================
CREATE PROCEDURE sp_ObtenerMenuPorId
    @IdMenu INT
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT IdMenu, Nombre, RutaHTML, Estado
    FROM Menu
    WHERE IdMenu = @IdMenu;
END;

-- =============================================
-- Actualizar un menú por ID
-- =============================================
CREATE PROCEDURE sp_ActualizarMenu
    @IdMenu INT,
    @Nombre NVARCHAR(100),
    @RutaHTML NVARCHAR(MAX),
    @Estado BIT
AS
BEGIN
    SET NOCOUNT ON;
    
    UPDATE Menu
    SET Nombre = @Nombre,
        RutaHTML = @RutaHTML,
        Estado = @Estado
    WHERE IdMenu = @IdMenu;

    -- Retornar el número de filas afectadas
    SELECT @@ROWCOUNT AS FilasAfectadas;
END;

-- =============================================
-- Eliminar un menú de forma lógica (desactivarlo)
-- =============================================
CREATE PROCEDURE sp_EliminarMenu
    @IdMenu INT
AS
BEGIN
    SET NOCOUNT ON;
    
    UPDATE Menu
    SET Estado = 0
    WHERE IdMenu = @IdMenu;
END;
