package testes;

import br.com.estudo.modulo.dao.Conexao;
import org.junit.Test;

/**
 * Created by Vinicius on 30/04/2015.
 */
public class TesteConexao {

    @Test
    public void testarConexao(){
        Conexao conexao = new Conexao();

        conexao.conectar();
    }
}
