package br.com.estudo.modulo.components;

import java.sql.Connection;

/**
 * Created by Vinicius on 30/04/2015.
 */
public abstract class AbstractDAO<T> {

    protected Connection connection = Conexao.getInstance().conectarMySql();

    public abstract T inserir(T entidade);

    public abstract Boolean excluir(Object id);

    public abstract T alterar(T entidade);

    public abstract T pesquisar(Object chavePrimaria);

}
