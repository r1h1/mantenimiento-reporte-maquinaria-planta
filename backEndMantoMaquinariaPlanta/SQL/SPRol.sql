-- =============================================
-- Crear un nuevo rol
-- =============================================
CREATE PROCEDURE sp_CrearRol
    @Nombre NVARCHAR(500),
    @IdMenu INT = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    INSERT INTO Rol (Nombre, IdMenu, Estado)
    VALUES (@Nombre, @IdMenu, 1);

    SELECT CAST(SCOPE_IDENTITY() AS INT) AS NuevoIdRol; -- Retorna el ID del nuevo registro
END;

-- =============================================
-- Obtener todos los roles activos
-- =============================================
CREATE PROCEDURE sp_ObtenerRoles
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT IdRol, Nombre, IdMenu, Estado
    FROM Rol
    WHERE Estado = 1; -- Solo roles activos
END;

-- =============================================
-- Obtener un rol por ID
-- =============================================
CREATE PROCEDURE sp_ObtenerRolPorId
    @IdRol INT
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT IdRol, Nombre, IdMenu, Estado
    FROM Rol
    WHERE IdRol = @IdRol;
END;

-- =============================================
-- Actualizar un rol por ID
-- =============================================
CREATE PROCEDURE sp_ActualizarRol
    @IdRol INT,
    @Nombre NVARCHAR(500),
    @IdMenu INT = NULL,
    @Estado BIT
AS
BEGIN
    SET NOCOUNT ON;
    
    UPDATE Rol
    SET Nombre = @Nombre,
        IdMenu = @IdMenu,
        Estado = @Estado
    WHERE IdRol = @IdRol;

    SELECT @@ROWCOUNT AS FilasAfectadas;
END;

-- =============================================
-- Eliminar un rol de forma lógica (desactivarlo)
-- =============================================
CREATE PROCEDURE sp_EliminarRol
    @IdRol INT
AS
BEGIN
    SET NOCOUNT ON;
    
    UPDATE Rol
    SET Estado = 0
    WHERE IdRol = @IdRol;

    SELECT @@ROWCOUNT AS FilasAfectadas;
END;
