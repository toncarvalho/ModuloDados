package br.com.estudo.modulo.dao;

import br.com.estudo.modulo.modelo.TipoCadastro;

import java.sql.PreparedStatement;
import java.sql.SQLException;

/**
 * Created by Vinicius on 30/04/2015.
 */
public class TipoCadastroDAO extends AbstractDAO<TipoCadastro> {
    @Override
    public TipoCadastro inserir(TipoCadastro entidade) {

        StringBuffer sql = new StringBuffer();

        sql.append("INSERT INTO TBTIPOCADASTRO VALUES (?,?)");

        Conexao conexao = new Conexao();

        conexao.conectar();

        try {
            PreparedStatement comando = conexao.conectar().prepareStatement(sql.toString());

            comando.setString(1, entidade.getTipoCadastro()); // set input parameter 1
            comando.setString(2, entidade.getDescricao()); // set input parameter 2
            comando.executeUpdate(); // execute insert statement

            conexao.conectar().close();
        } catch (SQLException e) {
            e.printStackTrace();
        }


        return null;
    }

    @Override
    public Boolean excluir(TipoCadastro entidade) {
        return null;
    }

    @Override
    public TipoCadastro alterar(TipoCadastro entidade) {
        return null;
    }

    @Override
    public TipoCadastro pesquisar(Object chavePrimaria) {
        return null;
    }
}
