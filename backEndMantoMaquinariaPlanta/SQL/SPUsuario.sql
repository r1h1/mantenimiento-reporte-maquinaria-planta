-- =============================================
-- Crear un nuevo usuario
-- =============================================
CREATE PROCEDURE sp_CrearUsuario
    @NombreCompleto NVARCHAR(255),
    @TelefonoPersonal VARCHAR(20) = NULL,
    @TelefonoCorporativo VARCHAR(20) = NULL,
    @Direccion NVARCHAR(255) = NULL,
    @CorreoElectronico NVARCHAR(255),
    @IdArea INT = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    INSERT INTO Usuarios (NombreCompleto, TelefonoPersonal, TelefonoCorporativo, Direccion, CorreoElectronico, IdArea, Estado)
    VALUES (@NombreCompleto, @TelefonoPersonal, @TelefonoCorporativo, @Direccion, @CorreoElectronico, @IdArea, 1);

    SELECT CAST(SCOPE_IDENTITY() AS INT) AS NuevoIdUsuario; -- Retorna el ID del nuevo registro
END;

-- =============================================
-- Obtener todos los usuarios activos
-- =============================================
CREATE PROCEDURE sp_ObtenerUsuarios
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT u.IdUsuario, u.NombreCompleto, u.TelefonoPersonal, u.TelefonoCorporativo, 
           u.Direccion, u.CorreoElectronico, u.IdArea, 
           a.Usuario, a.IdRol, u.Estado
    FROM Usuarios u
    LEFT JOIN Auth a ON a.IdUsuario = u.IdUsuario 
    WHERE u.Estado = 1;
END;

-- =============================================
-- Obtener un usuario por ID
-- =============================================
CREATE PROCEDURE sp_ObtenerUsuarioPorId
    @IdUsuario INT
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT u.IdUsuario, u.NombreCompleto, u.TelefonoPersonal, u.TelefonoCorporativo, 
           u.Direccion, u.CorreoElectronico, u.IdArea, 
           a.Usuario, a.IdRol, u.Estado
    FROM Usuarios u
    LEFT JOIN Auth a ON a.IdUsuario = u.IdUsuario 
    WHERE u.IdUsuario = @IdUsuario;
END;

-- =============================================
-- Actualizar un usuario por ID
-- =============================================
CREATE PROCEDURE sp_ActualizarUsuario
    @IdUsuario INT,
    @NombreCompleto NVARCHAR(255),
    @TelefonoPersonal VARCHAR(20) = NULL,
    @TelefonoCorporativo VARCHAR(20) = NULL,
    @Direccion NVARCHAR(255) = NULL,
    @CorreoElectronico NVARCHAR(255),
    @IdArea INT = NULL,
    @Estado BIT,
    @Usuario NVARCHAR(255) = NULL,
    @IdRol INT = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Actualizar Usuarios
    UPDATE Usuarios
    SET NombreCompleto = @NombreCompleto,
        TelefonoPersonal = @TelefonoPersonal,
        TelefonoCorporativo = @TelefonoCorporativo,
        Direccion = @Direccion,
        CorreoElectronico = @CorreoElectronico,
        IdArea = @IdArea,
        Estado = @Estado
    WHERE IdUsuario = @IdUsuario;

    -- Actualizar Auth si el usuario ya existe en la tabla Auth
    IF EXISTS (SELECT 1 FROM Auth WHERE IdUsuario = @IdUsuario)
    BEGIN
        UPDATE Auth
        SET Usuario = ISNULL(@Usuario, Usuario),  -- Solo actualizar si se envía un nuevo usuario
            IdRol = ISNULL(@IdRol, IdRol)  -- Solo actualizar si se envía un nuevo rol
        WHERE IdUsuario = @IdUsuario;
    END
    ELSE
    BEGIN
        -- Si no existe en Auth y se envía usuario y rol, insertarlo
        IF @Usuario IS NOT NULL AND @IdRol IS NOT NULL
        BEGIN
            INSERT INTO Auth (IdUsuario, Usuario, IdRol)
            VALUES (@IdUsuario, @Usuario, @IdRol);
        END
    END

    SELECT @@ROWCOUNT AS FilasAfectadas;
END;

-- =============================================
-- Eliminar un usuario de forma lógica (desactivarlo)
-- =============================================
CREATE PROCEDURE sp_EliminarUsuario
    @IdUsuario INT
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Desactivar al usuario en la tabla Usuarios
    UPDATE Usuarios
    SET Estado = 0
    WHERE IdUsuario = @IdUsuario;

    -- Desactivar al usuario en la tabla Auth
    UPDATE Auth
    SET Estado = 0
    WHERE IdUsuario = @IdUsuario;

    -- Retornar la cantidad de filas afectadas
    SELECT @@ROWCOUNT AS FilasAfectadas;
END;












