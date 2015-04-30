package br.com.estudo.modulo.dao;

/**
 * Created by Vinicius on 30/04/2015.
 */
public abstract class AbstractDAO <T>  {

    public abstract T inserir(T entidade);

    public abstract Boolean excluir(T entidade);

    public abstract T alterar(T entidade);

    public abstract T pesquisar(Object chavePrimaria);

}
