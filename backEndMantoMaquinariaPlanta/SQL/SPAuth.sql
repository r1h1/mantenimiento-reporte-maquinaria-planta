-- =============================================
-- Crear un nuevo registro de autenticación
-- =============================================
CREATE PROCEDURE sp_CrearAuth
    @Usuario NVARCHAR(500),
    @Clave NVARCHAR(500),
    @IdRol INT,
    @IdUsuario INT
AS
BEGIN
    SET NOCOUNT ON;
    
    INSERT INTO Auth (Usuario, Clave, FechaCreacion, IdRol, IdUsuario, Estado)
    VALUES (@Usuario, HASHBYTES('SHA2_256', @Clave), GETDATE(), @IdRol, @IdUsuario, 1);

    SELECT SCOPE_IDENTITY() AS NuevoIdAuth; -- Retorna el ID del nuevo registro
END;

-- =============================================
-- Obtener todas las cuentas de autenticación activas
-- =============================================
CREATE PROCEDURE sp_ObtenerAuth
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT IdAuth, Usuario, FechaCreacion, IdRol, IdUsuario, Estado
    FROM Auth
    WHERE Estado = 1; -- Solo cuentas activas
END;

-- =============================================
-- Obtener un registro de autenticación por ID
-- =============================================
CREATE PROCEDURE sp_ObtenerAuthPorId
    @IdAuth INT
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT IdAuth, Usuario, FechaCreacion, IdRol, IdUsuario, Estado
    FROM Auth
    WHERE IdAuth = @IdAuth;
END;

-- =============================================
-- Validar credenciales de usuario
-- =============================================
CREATE PROCEDURE sp_ValidarAuth
    @Usuario NVARCHAR(500),
    @Clave NVARCHAR(500)
AS
BEGIN
    SET NOCOUNT ON;
    
    IF EXISTS (
        SELECT 1 
        FROM Auth
        WHERE Usuario = @Usuario AND Clave = HASHBYTES('SHA2_256', @Clave) AND Estado = 1
    )
    BEGIN
        SELECT 'Acceso Concedido' AS Mensaje;
    END
    ELSE
    BEGIN
        SELECT 'Acceso Denegado' AS Mensaje;
    END;
END;

-- =============================================
-- Actualizar información de autenticación por ID
-- =============================================
CREATE PROCEDURE sp_ActualizarAuth
    @IdAuth INT,
    @Usuario NVARCHAR(500),
    @Clave NVARCHAR(500) = NULL,
    @IdRol INT,
    @IdUsuario INT,
    @Estado BIT
AS
BEGIN
    SET NOCOUNT ON;
    
    IF @Clave IS NOT NULL
    BEGIN
        UPDATE Auth
        SET Usuario = @Usuario,
            Clave = HASHBYTES('SHA2_256', @Clave),
            IdRol = @IdRol,
            IdUsuario = @IdUsuario,
            Estado = @Estado
        WHERE IdAuth = @IdAuth;
    END
    ELSE
    BEGIN
        UPDATE Auth
        SET Usuario = @Usuario,
            IdRol = @IdRol,
            IdUsuario = @IdUsuario,
            Estado = @Estado
        WHERE IdAuth = @IdAuth;
    END;
END;

-- =============================================
-- Eliminar un registro de autenticación de forma lógica (desactivarlo)
-- =============================================
CREATE PROCEDURE sp_EliminarAuth
    @IdAuth INT
AS
BEGIN
    SET NOCOUNT ON;
    
    UPDATE Auth
    SET Estado = 0
    WHERE IdAuth = @IdAuth;
END;
