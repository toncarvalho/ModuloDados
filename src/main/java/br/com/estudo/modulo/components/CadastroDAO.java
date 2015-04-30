package br.com.estudo.modulo.components;

import br.com.estudo.modulo.modelo.Cadastro;

import java.sql.Connection;

/**
 * Created by Vinicius on 30/04/2015.
 */
public class CadastroDAO extends AbstractDAO<Cadastro> {

    protected Connection connection;


    @Override
    public Cadastro inserir(Cadastro entidade) {
        return null;
    }

    @Override
    public Boolean excluir(Object id) {
        return null;
    }


    @Override
    public Cadastro alterar(Cadastro entidade) {
        return null;
    }

    @Override
    public Cadastro pesquisar(Object chavePrimaria) {
        return null;
    }


}
