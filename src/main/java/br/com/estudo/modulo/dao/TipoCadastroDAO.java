package br.com.estudo.modulo.dao;

import br.com.estudo.modulo.components.AbstractDAO;
import br.com.estudo.modulo.modelo.TipoCadastro;

import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.List;

/**
 * Created by Vinicius on 30/04/2015.
 */
public class TipoCadastroDAO extends AbstractDAO<TipoCadastro> {


    @Override
    public TipoCadastro inserir(TipoCadastro entidade) {

        Integer id = null;

        StringBuffer sql = new StringBuffer();

        /**
         * Quando trabalhamos com auto incremente do myql, o campo com auto increment , não deve ser incluido no insert...
         * se não usarmos auto incremente... pra funcionar basta tratar o campo como um outro qualquer...
         * e no PreparedStatement... não usar Statement.RETURN_GENERATED_KEYS
         * utilizar assim - > PreparedStatement comando = connection.prepareStatement(sql.toString());
         *
         *  e as linhas
         *    while (resultSet.next()) {
         id = resultSet.getInt(1);
         }
         também se tornam obsoletas, ja  que não temos nada pra retornar..
         *
         */

        //sql.append("INSERT INTO TipoCadastro (tipoCadastro,descricao) VALUES (?,?)");
        sql.append("INSERT INTO TipoCadastro (descricao) VALUES (?)");


        try {
            PreparedStatement comando = connection.prepareStatement(sql.toString(), Statement.RETURN_GENERATED_KEYS);


            //comando.setInt(1, entidade.getTipoCadastro());
            comando.setString(1, entidade.getDescricao());
            comando.execute();

            ResultSet resultSet = comando.getGeneratedKeys();

            while (resultSet.next()) {
                id = resultSet.getInt(1);
                System.out.println(" Id do registro recem inserido: " + id);
            }


            comando.close();

        } catch (SQLException e) {
            e.printStackTrace();
        }


        entidade.setTipoCadastro(id);

        return entidade;
    }

    @Override
    public Boolean excluir(Object id) {

        boolean resultado = false;


        StringBuffer sql = new StringBuffer();


        sql.append("DELETE  from TipoCadastro  WHERE  TipoCadastro.tipoCadastro =  ?");


        try {
            PreparedStatement comando = connection.prepareStatement(sql.toString());
            comando.setObject(1, id);

            resultado = comando.execute();


            System.out.println("  registro id: " + id + " excluido com sucess");

            comando.close();

        } catch (SQLException e) {
            e.printStackTrace();
        }

        return resultado;
    }


    @Override
    public TipoCadastro alterar(TipoCadastro entidade) {

        StringBuffer sql = new StringBuffer();

        /**
         * observação a chave nunca pode ser atualizada, por isso o campo TipoCadastro.tipoCadastro foi ignorado no update.
         */
        sql.append(" UPDATE  TipoCadastro SET  descricao = ?   WHERE  TipoCadastro.tipoCadastro =  ?");


        try {
            PreparedStatement comando = connection.prepareStatement(sql.toString());
            comando.setObject(1, entidade.getDescricao());
            comando.setObject(2, entidade.getTipoCadastro());

            int resultado = comando.executeUpdate();


            comando.close();

        } catch (SQLException e) {
            e.printStackTrace();
        }


        return entidade;
    }

    @Override
    public TipoCadastro pesquisar(Object chavePrimaria) {

        TipoCadastro entidade = null;

        StringBuffer sql = new StringBuffer();


        sql.append("Select * from TipoCadastro where TipoCadastro.tipoCadastro =  ? ");


        try {
            PreparedStatement comando = connection.prepareStatement(sql.toString());

            comando.setObject(1, chavePrimaria);

            ResultSet resultSet = comando.executeQuery();


            while (resultSet.next()) {

                return new TipoCadastro(resultSet.getInt("tipoCadastro"), resultSet.getString("descricao"));

            }


            comando.close();

        } catch (SQLException e) {
            e.printStackTrace();
        }


        return entidade;

    }


    public List<TipoCadastro> listaTodos() {


        List<TipoCadastro> lista = new ArrayList<TipoCadastro>();

        StringBuffer sql = new StringBuffer();


        sql.append("Select * from TipoCadastro ");


        try {
            PreparedStatement comando = connection.prepareStatement(sql.toString());


            ResultSet resultSet = comando.executeQuery();


            while (resultSet.next()) {

                lista.add(new TipoCadastro(resultSet.getInt("tipoCadastro"), resultSet.getString("descricao")));

            }


            comando.close();

        } catch (SQLException e) {
            e.printStackTrace();
        }


        return lista;


    }

    @Override
    protected void finalize() throws Throwable {

        connection.close();
        super.finalize();
    }
}
