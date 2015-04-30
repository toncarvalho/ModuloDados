package testes;

import br.com.estudo.modulo.components.Conexao;
import org.junit.Test;

import static junit.framework.Assert.assertNotNull;

/**
 * Created by Vinicius on 30/04/2015.
 */
public class TesteConexao {

    @Test
    public void testarConexaoMysql() {


        assertNotNull("conexão MYSQL falhou", Conexao.getInstance().conectarMySql());
    }


    // desabilitado temporariamente, para habilitar, basta adicionar a annotation @Test
    public void testarConexaoSqlServer() {


        assertNotNull("conexão SQLSERVER falhou", Conexao.getInstance().conectarSqlServer());
    }
}
